// Server-only delivery pricing. Never trust browser neighborhood or freight.
export const DELIVERY_CONTEXT=Symbol('delivery-quote');
const PERUS=['05201','05202','05203','05204','05205','05206','05207','05208','05209','05210','05211','05212','05215','05230'];
export const DEFAULT_ZONES=[
 {id:'perus',name:'Perus',city:'São Paulo',fee:10,active:true,ceps:PERUS,neighborhoods:[]},
 {id:'vila-aurora',name:'Vila Aurora — estação',city:'São Paulo',fee:15,active:true,ceps:['05186'],neighborhoods:[]},
 {id:'jaragua',name:'Jaraguá',city:'São Paulo',fee:15,active:true,ceps:[],neighborhoods:['Jaraguá']},
 {id:'taipas',name:'Taipas',city:'São Paulo',fee:20,active:true,ceps:[],neighborhoods:['Parada de Taipas','Parque Taipas','Parque Taipas - Parque das Flores','Jardim Taipas','Jardim Rincão','Conjunto Residencial Elisio Teixeira Leite']},
 {id:'vila-rosina',name:'Vila Rosina — Caieiras',city:'Caieiras',fee:20,active:true,ceps:[],neighborhoods:['Vila Rosina']},
 {id:'laranjeiras',name:'Laranjeiras — Caieiras',city:'Caieiras',fee:25,active:true,ceps:[],neighborhoods:['Laranjeiras']}
];
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,' ');
export function cleanCep(value){const s=String(value||'').trim();if(!/^\d{5}-?\d{3}$/.test(s))throw Error('Informe um CEP válido com 8 números.');return s.replace('-','');}
const matches=(cep,r)=>r.length===5?cep.startsWith(r):r.includes('-')?cep>=r.slice(0,8)&&cep<=r.slice(9):cep===r;
export function selectZone(zones,cep,address){
 const candidates=zones.filter(z=>normalize(z.city)===normalize(address.localidade)&&address.uf==='SP');
 // Explicit CEP rules override neighborhood rules, including paused regions.
 const zone=candidates.find(z=>z.ceps.some(r=>matches(cep,r)))||candidates.find(z=>z.neighborhoods.some(n=>normalize(n)===normalize(address.bairro)));
 return zone?.active?zone:null;
}
export function validateZones(input){
 if(!Array.isArray(input)||input.length!==DEFAULT_ZONES.length)throw Error('Tabela de regiões inválida.');
 const zones=DEFAULT_ZONES.map(base=>{
  const rows=input.filter(z=>z.id===base.id);if(rows.length!==1)throw Error('Região ausente ou repetida.');const z=rows[0];
  if(typeof z.fee!=='number'||!Number.isFinite(z.fee)||z.fee<0||z.fee>200||Math.abs(z.fee*100-Math.round(z.fee*100))>0.000001)throw Error('Informe um frete entre R$ 0 e R$ 200, com até duas casas decimais.');
  if(typeof z.active!=='boolean'||!Array.isArray(z.ceps)||z.ceps.length>200)throw Error('Configuração inválida.');
  const ceps=[...new Set(z.ceps.map(v=>String(v).trim()))];
  if(ceps.some(v=>!/^\d{5}$|^\d{8}$|^\d{8}-\d{8}$/.test(v)||(v.length===17&&v.slice(0,8)>v.slice(9))))throw Error('Use CEP com 8 números, prefixo com 5 ou intervalo de dois CEPs sem pontuação.');
  return {...base,fee:z.fee,active:z.active,ceps};
 });
 const bounds=r=>r.length===5?[r+'000',r+'999']:r.length===8?[r,r]:[r.slice(0,8),r.slice(9)];
 for(let i=0;i<zones.length;i++)for(let j=i+1;j<zones.length;j++)for(const a of zones[i].ceps)for(const b of zones[j].ceps){const [lo,hi]=bounds(a),[lo2,hi2]=bounds(b);if(lo<=hi2&&lo2<=hi)throw Error('Há CEPs sobrepostos em regiões diferentes.');}
 return zones;
}
async function getZones(env){const saved=await env.ORDERS_KV?.get('config:delivery-zones-v1','json');return saved?validateZones(saved):structuredClone(DEFAULT_ZONES);}
export async function quoteDelivery(env,value){
 const cep=cleanCep(value),zones=await getZones(env);
 // Preserve existing Perus coverage without depending on an external lookup.
 const legacy=DEFAULT_ZONES[0].ceps.some(p=>cep.startsWith(p));
 let address=legacy?{cep,localidade:'São Paulo',uf:'SP',bairro:'Perus'}:null;
 if(!address){
  address=await env.ORDERS_KV?.get(`delivery:cep-v1:${cep}`,'json');
  if(!address){
   const r=await fetch(`https://viacep.com.br/ws/${cep}/json/`,{signal:AbortSignal.timeout(5000)});
   if(!r.ok)throw Error('Consulta de CEP indisponível. Tente novamente.');const d=await r.json();
   if(d.erro||String(d.cep||'').replace(/\D/g,'')!==cep)throw Error('CEP não encontrado.');
   address={cep,localidade:d.localidade,uf:d.uf,bairro:d.bairro,logradouro:d.logradouro};
   await env.ORDERS_KV?.put(`delivery:cep-v1:${cep}`,JSON.stringify(address),{expirationTtl:86400});
  }
 }
 const zone=selectZone(zones,cep,address);
 return {cep,allowed:Boolean(zone),fee:zone?.fee??null,region:zone?.name??null,region_id:zone?.id??null,address};
}
export async function handleDelivery(request,env,ctx,next,headers){
 const url=new URL(request.url),reply=(data,status=200)=>Response.json(data,{status,headers:{...headers,'Cache-Control':'no-store'}});
 if(url.pathname==='/admin/delivery-zones'){
  // Authentication and role checks are performed by handleStaff before this handler.
  try{
   if(request.method==='GET')return reply({zones:await getZones(env)});
   if(request.method==='POST'){
    const raw=await request.text();if(raw.length>30000)return reply({erro:'Tabela muito grande.'},400);
    const zones=validateZones(JSON.parse(raw).zones);if(!env.ORDERS_KV)return reply({erro:'Armazenamento indisponível.'},503);
    await env.ORDERS_KV.put('config:delivery-zones-v1',JSON.stringify(zones));return reply({zones,ok:true});
   }
  }catch(e){return reply({erro:e.message},400);}
 }
 if(url.pathname==='/delivery/quote'&&request.method==='GET'){
  try{return reply(await quoteDelivery(env,url.searchParams.get('cep')));}catch(e){return reply({erro:e.message},400);}
 }
 if(request.method==='POST'&&['/criar-pix','/criar-pedido','/criar-checkout-pagbank','/criar-checkout-asaas','/criar-checkout-mercadopago'].includes(url.pathname)){
  const body=await request.clone().json().catch(()=>null);
  if(body?.customer?.fulfillment==='Entrega'){
   try{
    const quote=await quoteDelivery(env,body.customer.cep);
    if(!quote.allowed)return reply({erro:'CEP fora da área de entrega automática. Consulte o frete pelo WhatsApp.'},400);
    if(Number(body.delivery_fee)!==quote.fee)return reply({erro:'O frete foi atualizado. Consulte seu CEP novamente antes de pagar.',delivery:quote},409);
    return next(request,{...env,[DELIVERY_CONTEXT]:quote},ctx);
   }catch(e){return reply({erro:e.message},503);}
  }
 }
 return next(request,env,ctx);
}
