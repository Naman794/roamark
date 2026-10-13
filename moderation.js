export function isAdmin(user,emails=process.env.ADMIN_EMAILS||'namansinha64@gmail.com'){
 const allowed=emails.split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
 return Boolean(user?.googleSub&&user.accessType==='google'&&allowed.includes(String(user.email).toLowerCase()));
}
export function installModeration(app,{auth,Review,rate}){
 const guard=(req,res,next)=>isAdmin(req.user)?next():res.status(403).json({error:'Administrator access required.'});
 app.get('/api/admin/reviews',auth,guard,async(req,res,next)=>{try{
  const status=req.query.status||'pending';if(!['pending','published','rejected'].includes(status))return res.status(400).json({error:'Invalid review status.'});
  const page=Number(req.query.page||1);if(!Number.isInteger(page)||page<1||page>500)return res.status(400).json({error:'Invalid page.'});
  const rows=await Review.find({status}).sort({createdAt:-1,_id:-1}).skip((page-1)*20).limit(21).select('-user').lean();
  res.json({rows:rows.slice(0,20),hasMore:rows.length>20,page});
 }catch(e){next(e)}});
 app.post('/api/admin/reviews/:id',auth,guard,async(req,res,next)=>{try{
  const {status,expectedStatus,reason=''}=req.body;
  if(!/^[a-f0-9]{24}$/i.test(req.params.id)||!['pending','published','rejected'].includes(status)||!['pending','published','rejected'].includes(expectedStatus)||typeof reason!=='string'||reason.length>500||(status==='rejected'&&!reason.trim()))return res.status(400).json({error:'Choose a valid decision. Rejection needs a reason (up to 500 characters).'});
  await rate('moderation:'+req.user.id,100,3600);
  const row=await Review.findOneAndUpdate({_id:req.params.id,status:expectedStatus},{$set:{status,moderatedBy:req.user._id,moderatedAt:new Date(),moderationReason:reason.trim()}},{new:true});
  if(!row)return res.status(409).json({error:'This review changed or was removed. Refresh the queue.'});
  res.json({ok:true,status});
 }catch(e){next(e)}});
}
