import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
process.env.NODE_ENV='test';
const {default:app}=await import('../server.js');
function pages(dir='public'){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?pages(dir+'/'+e.name):e.name.endsWith('.html')&&e.name!=='place-template.html'?[dir+'/'+e.name]:[])}
test('All pages have crawlable metadata, share image, favicon and alt text',()=>{
 for(const file of pages()){
  const html=fs.readFileSync(file,'utf8');
  for(const token of ['<title>','name="description"','rel="canonical"','property="og:image"','name="twitter:card"','rel="icon"','name="viewport"','href="/mobile.css"'])assert.ok(html.includes(token),file+' '+token);
  assert.equal([...html.matchAll(/<link rel="canonical"/g)].length,1,file);
  assert.ok(!/<img\b(?![^>]*\balt=)[^>]*>/i.test(html),file);
  assert.ok(html.includes('href="/contact/"'),file);
 }
 const image=fs.readFileSync('public/assets/roamark-share.png');assert.equal(image.readUInt32BE(16),1200);assert.equal(image.readUInt32BE(20),630);
});
test('Sitemap lists existing public pages and excludes private and utility pages',()=>{
 const xml=fs.readFileSync('public/sitemap.xml','utf8');
 const urls=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]));
 assert.equal(urls.length,505);assert.equal(new Set(urls.map(u=>u.href)).size,505);
 for(const url of urls){assert.ok(!/^\/(api|admin|profile|review|thank-you)(\/|$)/.test(url.pathname));assert.ok(fs.existsSync('public'+url.pathname+'index.html'),url.href)}
 assert.ok(fs.readFileSync('public/robots.txt','utf8').includes('Sitemap: '+urls[0].origin+'/sitemap.xml'));
});
test('Custom 404 preserves HTTP status, utility pages load, and API errors stay JSON',async()=>{
 const server=app.listen(0),base='http://127.0.0.1:'+server.address().port;
 try{
  const missing=await fetch(base+'/a-missing-trail');assert.equal(missing.status,404);assert.match(missing.headers.get('content-type'),/text\/html/);assert.match(await missing.text(),/This path ends here/);
  const api=await fetch(base+'/api/not-a-route');assert.equal(api.status,404);assert.match(api.headers.get('content-type'),/application\/json/);
  for(const route of ['/thank-you/','/contact/','/sitemap.xml','/robots.txt','/assets/roamark-share.png'])assert.equal((await fetch(base+route)).status,200,route);
 }finally{await new Promise(resolve=>server.close(resolve))}
});
