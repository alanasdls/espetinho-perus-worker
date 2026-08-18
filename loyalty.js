(()=>{
  const URL='https://xikhljdlmeinihpeuwlj.supabase.co';
  const KEY='sb_publishable_SUPqs1Kjmmz_GIwVTDMFrA_WXDnNAM-';
  if(!window.supabase)return;
  const db=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.localStorage,storageKey:'espetinho-perus-auth'}});
  const AUTH_BACKUP_KEY='ep-supabase-session-backup';
  const saveBackup=session=>{try{if(session?.access_token&&session?.refresh_token)localStorage.setItem(AUTH_BACKUP_KEY,JSON.stringify({access_token:session.access_token,refresh_token:session.refresh_token}))}catch{}};
  const persistentSession=async()=>{
    let {data:{session}}=await db.auth.getSession();
    if(session){saveBackup(session);return session}
    try{const b=JSON.parse(localStorage.getItem(AUTH_BACKUP_KEY)||'null');if(b?.access_token&&b?.refresh_token){const {data,error}=await db.auth.setSession(b);if(!error&&data.session){saveBackup(data.session);return data.session}}}catch{}
    return null;
  };
  window.epLoyaltyDb=db;
  window.epLoyaltyGetAccessToken=async()=>{
    const session=await persistentSession();
    if(!session)return '';
    window.epLoyaltyCustomerId=session.user.id;
    window.epLoyaltyAccessToken=session.access_token||'';
    return window.epLoyaltyAccessToken;
  };
  const box=document.getElementById('loyaltyCartBox');
  const status=document.getElementById('loyaltyCartStatus');
  const action=document.getElementById('loyaltyCartAction');
  const setValue=(id,v)=>{const el=document.getElementById(id);if(el&&!el.value&&v)el.value=v};
  async function sync(){
    const session=await persistentSession();
    if(!session){window.epLoyaltyCustomerId='';window.epLoyaltyAccessToken='';localStorage.removeItem('ep-loyalty-user-id');if(status)status.textContent='Entre para acumular pontos neste pedido.';if(action){action.textContent='Entrar / criar conta';action.href='cliente.html'}return}
    window.epLoyaltyCustomerId=session.user.id;window.epLoyaltyAccessToken=session.access_token||'';localStorage.setItem('ep-loyalty-user-id',session.user.id);
    const {data:p}=await db.from('clientes').select('nome,telefone,pontos').eq('id',session.user.id).maybeSingle();
    setValue('customerName',p?.nome||session.user.user_metadata?.nome);setValue('customerEmail',session.user.email);setValue('customerPhone',p?.telefone||session.user.user_metadata?.telefone);
    if(status)status.textContent=`Conta conectada • ${Number(p?.pontos||0).toLocaleString('pt-BR')} pontos disponíveis`;
    if(action){action.textContent='Ver meus pontos';action.href='cliente.html'}
    document.body.classList.add('loyalty-logged');
  }
  sync();db.auth.onAuthStateChange((_event,session)=>{if(session)saveBackup(session);sync()});
})();
