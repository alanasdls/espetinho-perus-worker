import {asaasConfig} from './asaas-payments.js';
// Server-only reward checkout. Browser prices and point costs are never trusted.
export const REWARD_CONTEXT = Symbol('reward-checkout');
export const CHECKOUT_PATHS = ['/criar-pix','/criar-pedido','/criar-checkout-mercadopago','/criar-checkout-pagbank','/criar-checkout-asaas'];
export function quoteRewards(body, prices, codes) {
  const lines = body.items;
  if (!Array.isArray(lines) || !lines.length || lines.length > 100) throw Error('Carrinho inválido.');
  let points=0, discount=0;
  const rewards=[];
  for(const item of lines){
    const quantity=Number(item.quantity);
    if(!Number.isInteger(quantity)||quantity<1||quantity>50)throw Error('Quantidade inválida.');
    if(item.reward !== true)continue;
    const name=String(item.name||'');
    if(!Object.hasOwn(prices,name)||!Object.hasOwn(codes,name))throw Error('Produto indisponível para resgate.');
    const price=Number(prices[name]);
    points+=Math.ceil(price*20)*quantity;
    discount+=Math.round(price*100)*quantity;
    rewards.push({name,quantity,points:Math.ceil(price*20)*quantity});
  }
  if(!points)throw Error('Nenhum produto de resgate.');
  return {points,discount:discount/100,rewards};
}
export async function rewardRpc(env, action, data){
  const key=env.SUPABASE_SERVICE_ROLE_KEY;
  if(!env.SUPABASE_URL||!key)throw Error('Serviço de resgate indisponível.');
  const r=await fetch(`${env.SUPABASE_URL.replace(/\/$/,'')}/rest/v1/rpc/checkout_resgate_v1`,{
    method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
    body:JSON.stringify({p_action:action,p_data:data})
  });
  const result=await r.json();
  if(!r.ok){
    const msg=String(result.message||'');
    if(msg.includes('PONTOS_INSUFICIENTES')){const error=Error('Pontos insuficientes ou reservados em outro pedido.');error.safeToRetry=true;throw error;}
    if(msg.includes('CONFLITO'))throw Error('Este checkout já foi iniciado com outros dados. Retome o pedido pendente.');
    throw Error('Não foi possível confirmar o resgate. Tente novamente com o mesmo pedido.');
  }
  return result;
}
export async function saveRewardOrder(env, order){
  const context=env[REWARD_CONTEXT];
  if(context && order.order_id===context.orderId){
    order.reward_checkout={customer_id:context.userId,order_id:context.orderId,points:context.points,rewards:context.rewards};
    order.reward_discount_amount=context.discount;
    order.items=order.items.map((item,index)=>({...item,reward:context.lines[index]?.reward===true}));
  }
  if(!order.reward_checkout)return;
  const saved=await rewardRpc(env,'save',{customer_id:order.reward_checkout.customer_id,order_id:order.order_id,order});
  if(saved.order)Object.assign(order,saved.order);
}
export async function handleRewardCheckout(request,env,ctx,core,deps){
  const url=new URL(request.url);
  const respond=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{...deps.headers,"Content-Type":"application/json"}});
  if(request.method==='GET'&&url.pathname==='/fidelidade/checkout-capabilities')return respond({reward_cart:true,version:1});
  if(request.method!=='POST'||!CHECKOUT_PATHS.includes(url.pathname))return core(request,env,ctx);
  if(url.pathname==='/criar-checkout-asaas'&&!asaasConfig(env).ready)return respond({erro:'Pagamento por cartão indisponível.',retry_allowed:true},503);
  const body=await request.clone().json().catch(()=>null);
  if(!body?.items?.some?.(item=>item.reward===true))return core(request,env,ctx);
  let context,attemptedOpen=false;
  try{
    const user=await deps.authenticate(request,env);
    if(!user?.id)return respond({erro:'Entre na sua conta para resgatar pontos.',retry_allowed:true},401);
    if(body.reward_customer_id!==user.id)throw Error('O resgate pertence a outra conta. Volte à sua conta e escolha o produto novamente.');
    const delivery=await deps.store(env);
    if(!delivery.aberto)return respond({erro:'Pedidos fechados no momento. Seu carrinho foi mantido.',retry_allowed:true},403);
    const quote=quoteRewards(body,deps.prices,deps.codes);
    if(!/^EP-R-[a-f0-9-]{36}$/.test(body.order_id||''))throw Error('Identificador de checkout inválido.');
    // Validate delivery, identity and every price before reserving any points.
    deps.delivery(body);
    if(!body.customer?.name||!body.customer?.phone||!body.customer?.email)throw Error('Preencha nome, telefone e e-mail.');
    let gross=0;
    for(const item of body.items){
      if(!Object.hasOwn(deps.prices,item.name))throw Error('Produto indisponível. Atualize o cardápio.');
      gross+=Math.round(deps.prices[item.name]*100)*item.quantity;
    }
    const fingerprint=JSON.stringify({path:url.pathname,customer:body.customer,items:body.items,coupon:body.coupon_code||null});
    const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(fingerprint))),x=>x.toString(16).padStart(2,'0')).join('');
    context={...quote,userId:user.id,orderId:body.order_id,lines:body.items};
    const scoped={...env,[REWARD_CONTEXT]:context};
    const discount=deps.discounts(scoped,body,gross/100,true).total_discount;
    const total=Math.round((gross/100-discount+deps.delivery(body).fee)*100)/100;
    attemptedOpen=true;
    const entry=await rewardRpc(env,'open',{customer_id:user.id,order_id:body.order_id,points:quote.points,fingerprint:hash});
    if(!entry.created){
      if(entry.order?.payment_status==='approved')return respond({status:'approved',tracking_token:entry.order.tracking_token,order_id:body.order_id,total:entry.order.total});
      if(entry.response)return respond({...entry.response.body,reservation_state:entry.state},entry.response.status);
      if(entry.order){
        return respond({erro:'Este pedido já foi iniciado. Acompanhe o pagamento antes de criar outro.',tracking_token:entry.order.tracking_token,order_id:body.order_id,resume:true},409);
      }
      return respond({erro:'Confirmação em andamento. Aguarde alguns segundos e tente novamente.',retry_same_order:true},409);
    }
    // A zero-total pickup uses the order confirmation route, never a zero-value payment.
    if(total===0)url.pathname='/criar-pedido';
    const inner=new Request(url, {method:'POST',headers:request.headers,body:JSON.stringify(body)});
    const response=await core(inner,scoped,ctx);
    const data=await response.clone().json();
    const saved=await rewardRpc(env,'response',{customer_id:user.id,order_id:body.order_id,response:{status:response.status,body:data}});
    return respond({...saved.response.body,reservation_state:saved.state},saved.response.status);
  }catch(error){
    console.error('reward checkout',error.message);
    // Never repeat a gateway request automatically after an ambiguous failure.
    return respond({erro:error.message||'Falha ao confirmar pedido.',retry_same_order:attemptedOpen&&!error.safeToRetry,retry_allowed:!attemptedOpen||Boolean(error.safeToRetry)},400);
  }
}
