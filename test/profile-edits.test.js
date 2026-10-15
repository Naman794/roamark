import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {profileEdits,installProfileEditing} from '../profile-edits.js';
const photo='data:image/jpeg;base64,'+Buffer.from([255,216,255,224,0,0,0,0,0,0,255,217]).toString('base64');
test('Profile fields trim text, clear optional values, and reject identity/role changes',()=>{
 assert.deepEqual(profileEdits({name:' Param ',bio:' Hiking\nDays ',location:' Delhi '}),{name:'Param',bio:'Hiking\nDays',location:'Delhi'});
 assert.deepEqual(profileEdits({bio:'',location:''}),{bio:'',location:''});
 for(const body of [{},{email:'other@example.com'},{isAdmin:true},{googleSub:'x'},{name:''},{name:'x'.repeat(41)},{bio:'x'.repeat(241)},{location:'x'.repeat(81)},{name:{$set:'x'}},{name:'a\nb'},null,[]])assert.throws(()=>profileEdits(body),{status:400});
});
test('Profile avatars enforce raster size limits and explicit removal prevents Google replacement',()=>{
 assert.deepEqual(profileEdits({avatar:photo}),{avatar:photo,avatarSource:'custom'});
 assert.deepEqual(profileEdits({avatar:''}),{avatar:'',avatarSource:'custom'});
 for(const value of ['https://example.com/image.jpg','data:image/svg+xml;base64,AAAA',null,'data:image/jpeg;base64,'+Buffer.concat([Buffer.from([255,216,255]),Buffer.alloc(204800)]).toString('base64')])assert.throws(()=>profileEdits({avatar:value}),{status:400});
});
test('Editing requires authentication, saves only the current user, and returns bounded profile data',async()=>{
 const app=express();app.use(express.json());let saves=0,rates=0;
 const user={id:'current-user',name:'Old',email:'private@example.com',async save(){saves++}};
 installProfileEditing(app,{auth:(req,res,next)=>{if(req.get('x-session')!=='valid')return res.status(401).json({error:'Please sign in.'});req.user=user;next()},rate:async(key,max,seconds)=>{rates++;assert.equal(key,'profile:current-user');assert.equal(max,20);assert.equal(seconds,3600)}});
 app.use((error,req,res,next)=>res.status(error.status||500).json({error:error.message}));
 const server=app.listen(0),base='http://127.0.0.1:'+server.address().port;
 const send=(body,signed=true)=>fetch(base+'/api/me',{method:'PATCH',headers:{'Content-Type':'application/json',...(signed?{'x-session':'valid'}:{})},body:JSON.stringify(body)});
 try{
  assert.equal((await send({name:'New'},false)).status,401);assert.equal(saves,0);
  assert.equal((await send({email:'change@example.com'})).status,400);assert.equal(saves,0);
  const response=await send({name:'New',bio:'Trail days',avatar:photo});assert.equal(response.status,200);const body=await response.json();assert.equal(body.name,'New');assert.equal(body.avatar,photo);assert.equal(body.email,undefined);assert.equal(body.id,undefined);assert.equal(user.email,'private@example.com');assert.equal(user.avatarSource,'custom');assert.equal(saves,1);assert.equal(rates,1);
 }finally{await new Promise(resolve=>server.close(resolve))}
});
