function staffNextStatuses(order){
 const next={recebido:'em_preparo',em_preparo:'pronto_retirada',pronto_retirada:order.customer?.fulfillment==='Entrega'?'saiu_entrega':'finalizado',saiu_entrega:'finalizado'}[order.order_status];
 return next&&(staffUser?.role!=='cozinha'||['em_preparo','pronto_retirada'].includes(next))?[next]:[];
}
window.applyStaffAccess=()=>{
 if(!staffUser)return;
 document.body.dataset.staffRole=staffUser.role;
 $('#staffIdentity').textContent=`${staffUser.email} • ${staffUser.role} • sessão de até 8 horas`;
 document.querySelectorAll('.tab').forEach(el=>{if(el.dataset.tab!=='ordersTab')el.hidden=staffUser.role!=='admin';});
 document.querySelectorAll('[data-admin-only], #alertsBtn').forEach(el=>el.hidden=staffUser.role!=='admin');
 if(staffUser.role==='cozinha')document.querySelector('.delivery-control-actions').hidden=true;
 if(staffUser.role==='admin')loadStaffAccess();
};
$('#staffMode').onchange=()=>{
 const mode=$('#staffMode').value;$('#staffActivation').hidden=mode==='login';
 $('#staffActivationLabel').textContent=mode==='bootstrap'?'Chave atual do painel':'Código do convite';
};
async function loadStaffAccess(){
 try{
  const d=await api('/admin/security/access');
  $('#staffUsers').innerHTML=d.users.map(u=>`<form class="staff-user" data-user="${esc(u.id)}"><b>${esc(u.email)}</b><select aria-label="Função">${['admin','atendimento','cozinha'].map(r=>`<option ${u.role===r?'selected':''} value="${r}">${r}</option>`).join('')}</select><label><input type="checkbox" ${u.active?'checked':''}> Ativo</label><button>Salvar acesso</button></form>`).join('');
  $('#staffSessions').innerHTML=d.sessions.map(s=>`<div class="staff-row"><span>${esc(s.email)}<small>Expira: ${esc(new Date(s.expires).toLocaleString('pt-BR'))}</small></span><button data-revoke="${esc(s.id)}">Encerrar sessão</button></div>`).join('')||'<p>Nenhuma sessão.</p>';
  const names={bootstrap:'Primeiro administrador ativado',login:'Entrada no painel',logout:'Saída do painel',login_failed:'Falha no login',login_denied:'Acesso negado',invitation_accepted:'Convite aceito',invite_created:'Convite criado',access_changed:'Permissões alteradas',session_revoked:'Sessão encerrada',access_denied:'Operação bloqueada',action_requested:'Operação iniciada',action_result:'Resultado da operação'};
  $('#staffAudit').innerHTML=d.audit.map(a=>`<div class="staff-row"><span><b>${esc(names[a.action]||a.action)}</b><small>${esc(a.actor)} • ${esc(new Date(a.at).toLocaleString('pt-BR'))}</small><small>${esc(a.target)} • ${a.status}</small></span></div>`).join('');
 }catch(e){$('#staffError').textContent=e.message;}
}
$('#staffRefresh').onclick=loadStaffAccess;
$('#staffInviteForm').onsubmit=async e=>{
 e.preventDefault();$('#inviteResult').textContent='';
 try{const d=await api('/admin/security/invite',{method:'POST',body:JSON.stringify({email:$('#inviteEmail').value,role:$('#inviteRole').value})});$('#inviteResult').textContent='Código de uso único: '+d.code;await loadStaffAccess();}catch(e){$('#staffError').textContent=e.message;}
};
$('#staffUsers').onsubmit=async e=>{
 e.preventDefault();const f=e.target;
 try{await api('/admin/security/user',{method:'POST',body:JSON.stringify({userId:f.dataset.user,role:f.querySelector('select').value,active:f.querySelector('input').checked})});$('#staffError').textContent='Acesso atualizado. As sessões deste usuário foram encerradas.';await loadStaffAccess();}catch(e){$('#staffError').textContent=e.message;}
};
$('#staffSessions').onclick=async e=>{const b=e.target.closest('[data-revoke]');if(!b)return;try{await api('/admin/security/revoke',{method:'POST',body:JSON.stringify({sessionId:b.dataset.revoke})});await loadStaffAccess();}catch(e){$('#staffError').textContent=e.message;}};
if(staffUser)window.applyStaffAccess();
