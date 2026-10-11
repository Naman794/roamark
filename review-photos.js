// Only bounded raster uploads; no SVG, remote URLs or executable content.
export function validatePhotos(value=[]){
 const fail=()=>{throw Object.assign(new Error('Add up to three JPEG, PNG or WebP photos, each under 600 KB.'),{status:400})};
 if(!Array.isArray(value)||value.length>3)fail();
 return value.map(photo=>{
  if(typeof photo!=='string'||photo.length>820000)fail();
  const m=photo.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/);if(!m)fail();
  const b=Buffer.from(m[2],'base64');if(b.length<12||b.length>614400||b.toString('base64')!==m[2])fail();
  const valid=m[1]==='jpeg'?b[0]===255&&b[1]===216&&b[2]===255:m[1]==='png'?b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP';
  if(!valid)fail();return photo;
 });
}
