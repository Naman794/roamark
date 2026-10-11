export function ageInYears(value,now=new Date()){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
 const [year,month,day]=value.split('-').map(Number),date=new Date(Date.UTC(year,month-1,day));
 if(year<1900||date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day||date>now)return null;
 let age=now.getUTCFullYear()-year;if(now.getUTCMonth()+1<month||(now.getUTCMonth()+1===month&&now.getUTCDate()<day))age--;return age;
}
