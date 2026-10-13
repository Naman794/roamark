export function youtubeId(value){
 if(typeof value!=='string'||value.length>1024)return null;
 try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port)return null;let id;
 if(u.hostname==='youtu.be')id=u.pathname.slice(1);
 else if(['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname)){if(u.pathname==='/watch')id=u.searchParams.get('v');else id=u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)$/)?.[1]}
 return /^[A-Za-z0-9_-]{11}$/.test(id||'')?id:null;
 }catch{return null}
}
