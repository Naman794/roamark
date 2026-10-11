import mongoose from 'mongoose';
let pending;
export function databaseFailure(error){
 const name=error?.name||'';const message=String(error?.message||'');const code=error?.code||error?.cause?.code;
 if(code===18||/authentication failed|bad auth/i.test(message))return {code:'DATABASE_AUTH_FAILED',message:'MongoDB authentication failed. Check the Atlas database username and password in MONGODB_URI.'};
 if(code===13||/not authorized|unauthorized/i.test(message))return {code:'DATABASE_PERMISSION_DENIED',message:'The MongoDB user cannot access the Roamark database. Grant read and write access to that database.'};
 if(/parse|invalid scheme|invalid connection string/i.test(name+' '+message))return {code:'DATABASE_URI_INVALID',message:'MONGODB_URI is invalid. Use the Atlas Node.js connection string and URL-encode special characters in its password.'};
 if(/ENOTFOUND|querySrv|DNS/i.test(message))return {code:'DATABASE_DNS_FAILED',message:'The MongoDB cluster address could not be resolved. Check the cluster hostname in MONGODB_URI.'};
 return {code:'DATABASE_UNREACHABLE',message:'The app cannot reach MongoDB Atlas. Check Atlas Network Access for your hosting service and confirm the cluster is running.'};
}
function failure(info){return Object.assign(new Error(info.message),{status:503,publicCode:info.code});}
export async function db(){
 const uri=(process.env.MONGODB_URI||'').trim();
 if(!uri)throw failure({code:'DATABASE_NOT_CONFIGURED',message:'MONGODB_URI is missing from the hosting environment. Add the Atlas connection string and redeploy.'});
 if(!/^mongodb(?:\+srv)?:\/\//.test(uri)||/<[^>]+>/.test(uri))throw failure({code:'DATABASE_URI_INVALID',message:'MONGODB_URI contains an invalid scheme or unreplaced placeholder. Use your complete Atlas connection string.'});
 if(mongoose.connection.readyState===1)return;
 if(!pending)pending=mongoose.connect(uri,{serverSelectionTimeoutMS:10000,connectTimeoutMS:10000,maxPoolSize:10}).then(()=>{}).catch(error=>{throw failure(databaseFailure(error));}).finally(()=>{pending=null});
 await pending;
}
