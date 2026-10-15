(()=>{const tag=document.createElement('script');tag.src='/analytics.js';document.head.append(tag)})();
(()=>{const button=document.getElementById('account');if(!button)return;
window.refreshNavigation=async()=>{try{const response=await fetch('/api/me');if(!response.ok){if(response.status===401){button.textContent='Sign in / Sign up';button.onclick=null;button.setAttribute('href','/profile/');button.removeAttribute('aria-label')}return;}button.textContent='Log out';button.setAttribute('aria-label','Log out of Roamark');button.onclick=async event=>{event.preventDefault();button.style.pointerEvents='none';try{const r=await fetch('/api/auth/logout',{method:'POST'});if(!r.ok)throw Error('Unable to log out. Please try again.');location.href='/';}catch(e){button.style.pointerEvents='';alert(e.message)}};}catch{}};window.refreshNavigation();})();
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
