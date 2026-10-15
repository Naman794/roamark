/* Optional Google Analytics. No Google requests are made until consent. */
(()=>{
  const id='G-VN6QQXWDF5',key='roamark-analytics-consent';
  let loaded=false;
  const disabledPage=/^\/(admin|profile|review|thank-you)(\/|$)/.test(location.pathname);
  function read(){try{return localStorage.getItem(key)}catch{return null}}
  function load(){
    if(disabledPage)return;
    window['ga-disable-'+id]=false;
    if(loaded){window.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});return}
    loaded=true;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments)};
    window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('js',new Date());
    window.gtag('config',id,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});
    // Do not send query strings, fragments, form contents or account identifiers.
    window.gtag('event','page_view',{page_location:location.origin+location.pathname,page_referrer:'',page_title:document.title});
    const tag=document.createElement('script');tag.async=true;tag.src='https://www.googletagmanager.com/gtag/js?id='+id;document.head.append(tag);
  }
  function choose(value){
    try{localStorage.setItem(key,value)}catch{}
    if(value==='accepted')load();
    else{
      window['ga-disable-'+id]=true;
      window.gtag?.('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
      for(const cookie of document.cookie.split(';')){
        const name=cookie.split('=')[0].trim();if(!/^_ga(?:_|$)/.test(name))continue;
        const domains=location.hostname.split('.');
        document.cookie=name+'=; Max-Age=0; Path=/';
        for(let i=0;i<domains.length-1;i++)document.cookie=name+'=; Max-Age=0; Path=/; Domain=.'+domains.slice(i).join('.');
      }
    }
    banner.hidden=true;settings.focus();
  }
  const css=document.createElement('link');css.rel='stylesheet';css.href='/analytics.css';document.head.append(css);
  const banner=document.createElement('section');banner.className='cookie-banner';banner.setAttribute('aria-label','Analytics cookie preferences');
  banner.innerHTML='<div><strong>A little insight, with your permission.</strong><p>Allow Google Analytics to help us understand how Roamark is used? Essential sign-in works either way. <a href="/privacy/">Privacy policy</a></p></div><div class="cookie-actions"><button type="button" class="outline" data-choice="rejected">Reject analytics</button><button type="button" class="primary" data-choice="accepted">Accept analytics</button></div>';
  banner.querySelectorAll('[data-choice]').forEach(button=>button.onclick=()=>choose(button.dataset.choice));
  const settings=document.createElement('button');settings.type='button';settings.className='cookie-settings';settings.textContent='Cookie settings';settings.onclick=()=>{banner.hidden=false;banner.querySelector('button').focus()};
  document.body.append(banner,settings);
  const choice=read();banner.hidden=choice==='accepted'||choice==='rejected';if(choice==='accepted')load();
  window.addEventListener('storage',event=>{if(event.key===key){if(event.newValue==='accepted')load();else window['ga-disable-'+id]=true;banner.hidden=event.newValue==='accepted'||event.newValue==='rejected'}});
})();
