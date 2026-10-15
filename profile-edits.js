import {validatePhotos} from './review-photos.js';
const fail=message=>{throw Object.assign(new Error(message),{status:400})};
export function profileEdits(body){
 if(!body||typeof body!=='object'||Array.isArray(body))fail('Enter valid profile details.');
 const allowed=['name','bio','location','avatar'];
 if(!Object.keys(body).length||Object.keys(body).some(key=>!allowed.includes(key)))fail('Only name, bio, location and profile photo can be edited.');
 const result={};
 for(const [key,max] of [['name',40],['bio',240],['location',80]])if(Object.hasOwn(body,key)){
  if(typeof body[key]!=='string')fail('Enter valid '+key+'.');
  const value=body[key].trim();
  if(value.length>max||(key==='name'&&!value)||/[\u0000-\u0008\u000b-\u001f\u007f]/.test(value)||(key!=='bio'&&/[\n\t]/.test(value)))fail(key==='name'?'Display name must contain 1–40 characters.':key+' must contain at most '+max+' characters, without control characters.');
  result[key]=value;
 }
 if(Object.hasOwn(body,'avatar')){
  if(body.avatar==='')result.avatar='';
  else{
   try{result.avatar=validatePhotos([body.avatar])[0]}catch{fail('Use a JPEG, PNG or WebP profile photo under 200 KB.')}
   if(Buffer.from(result.avatar.split(',')[1],'base64').length>204800)fail('Use a profile photo under 200 KB.');
  }
  result.avatarSource='custom';
 }
 return result;
}

export function installProfileEditing(app,{auth,rate}){
 app.patch('/api/me',auth,async(req,res,next)=>{try{const changes=profileEdits(req.body);await rate('profile:'+req.user.id,20,3600);Object.assign(req.user,changes);await req.user.save();res.json({name:req.user.name,bio:req.user.bio||'',location:req.user.location||'',avatar:req.user.avatar||''})}catch(error){next(error)}});
}
