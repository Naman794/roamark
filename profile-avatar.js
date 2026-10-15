// Accept only HTTPS Google profile pictures returned by authenticated userinfo.
export function googleAvatar(value){
 if(typeof value!=='string'||value.length>2048)return '';
 try{const url=new URL(value);return url.protocol==='https:'&&/^[a-z0-9-]+\.googleusercontent\.com$/i.test(url.hostname)&&!url.username&&!url.password&&!url.port?url.href:''}catch{return ''}
}
