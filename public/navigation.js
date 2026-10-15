(()=>{const tag=document.createElement('script');tag.src='/analytics.js';document.head.append(tag)})();
(()=>{
 const header=document.querySelector('header');if(!header)return;
 let account=document.getElementById('account')||header.querySelector('a.primary');
 if(!account){account=document.createElement('a');header.append(account)}
 account.id='account';
 let menu=null,version=0;
 const close=restore=>{if(menu?.open){menu.open=false;if(restore)menu.querySelector('summary').focus()}};
 document.addEventListener('click',event=>{if(menu&&!menu.contains(event.target))close(false)});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')close(true)});
 document.addEventListener('focusin',event=>{if(menu&&!menu.contains(event.target))close(false)});
 const initials=name=>String(name||'Traveler').trim().split(/\s+/).slice(0,2).map(part=>Array.from(part)[0]||'').join('').toUpperCase()||'T';
 const picture=value=>{if(typeof value==='string'&&value.length<280000&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value))return value;try{const u=new URL(value);return u.protocol==='https:'&&/^[a-z0-9-]+\.googleusercontent\.com$/i.test(u.hostname)&&!u.username&&!u.password&&!u.port?u.href:''}catch{return ''}};
 function signedOut(){
  const link=document.createElement('a');link.id='account';link.className='primary';link.href='/profile/';link.textContent='Sign in / Sign up';
  (menu||account).replaceWith(link);account=link;menu=null;
 }
 function signedIn(user){
  const next=document.createElement('details');next.className='account-menu';
  const trigger=document.createElement('summary');trigger.id='account';trigger.className='account-avatar';trigger.setAttribute('aria-label','Open account options for '+(user.name||'Traveler'));trigger.setAttribute('aria-controls','account-dropdown');trigger.setAttribute('aria-expanded','false');
  const fallback=document.createElement('span');fallback.textContent=initials(user.name);fallback.setAttribute('aria-hidden','true');trigger.append(fallback);
  const avatar=picture(user.avatar);
  if(avatar){const img=document.createElement('img');img.src=avatar;img.alt='';img.referrerPolicy='no-referrer';img.onerror=()=>img.remove();trigger.append(img)}
  const panel=document.createElement('div');panel.id='account-dropdown';panel.className='account-dropdown';
  const identity=document.createElement('div');identity.className='account-menu-identity';
  const name=document.createElement('strong');name.textContent=user.name||'Traveler';const subtitle=document.createElement('span');subtitle.textContent='Your Roamark account';identity.append(name,subtitle);panel.append(identity);
  const links=[['My profile','/profile/'],['Edit profile','/profile/?edit=1'],['Saved places','/profile/?tab=saved'],['My reviews','/profile/?tab=reviews'],['Write a review','/review/']];
  if(user.isAdmin)links.push(['Admin panel','/admin/']);
  for(const [label,href] of links){const link=document.createElement('a');link.textContent=label;link.href=href;link.onclick=()=>close(false);panel.append(link)}
  const logout=document.createElement('button');logout.type='button';logout.className='account-menu-logout';logout.textContent='Log out';
  const error=document.createElement('p');error.className='account-menu-error';error.setAttribute('role','status');error.hidden=true;
  logout.onclick=async()=>{logout.disabled=true;logout.textContent='Logging out…';error.hidden=true;try{const response=await fetch('/api/auth/logout',{method:'POST'});if(!response.ok)throw Error('Could not log out. Please try again.');location.assign('/')}catch(e){error.textContent=e.message;error.hidden=false;logout.disabled=false;logout.textContent='Log out'}};
  panel.append(logout,error);next.append(trigger,panel);next.addEventListener('toggle',()=>trigger.setAttribute('aria-expanded',String(next.open)));
  (menu||account).replaceWith(next);menu=next;account=trigger;
 }
 window.refreshNavigation=async()=>{const request=++version;try{const response=await fetch('/api/me');if(request!==version)return;if(response.status===401){signedOut();return}if(!response.ok)return;const user=await response.json();if(request===version)signedIn(user)}catch{}};
 window.refreshNavigation();
})();
(()=>{
 const route=location.pathname;
 document.querySelectorAll('footer').forEach(footer=>{if(!footer.querySelector('a[href="/contact/"]')){const link=document.createElement('a');link.href='/contact/';link.textContent='Contact';footer.append(link)}});
 if(route==='/'||route==='/india/'||route.startsWith('/places/')){
  const cta=document.createElement('aside');cta.className='mobile-travel-cta';cta.setAttribute('aria-label','Travel actions');
  const place=route.match(/^\/places\/([^/]+)\/$/);
  const note=document.createElement('span');note.textContent=place?'Been here? Share your perspective.':'Your next journey starts here.';
  const link=document.createElement('a');link.className='primary';link.href=place?'/review/?place='+encodeURIComponent(place[1]):'/india/';link.textContent=place?'Write a review ↗':'Explore places ↗';
  cta.append(note,link);document.body.append(cta);document.body.classList.add('has-mobile-travel-cta');
 }
})();
