import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const source=fs.readFileSync('public/analytics.js','utf8');
function boot(choice=null,pathname='/places/rishikesh/'){
 const head=[],body=[],buttons=['rejected','accepted'].map(choice=>({dataset:{choice},focus(){}}));
 const document={title:'Rishikesh — Roamark',cookie:'',head:{append:tag=>head.push(tag)},body:{append:(...tags)=>body.push(...tags)},createElement:type=>({type,setAttribute(){},querySelectorAll:()=>buttons,querySelector:()=>buttons[0],focus(){}})};
 const window={addEventListener(){}};
 vm.runInNewContext(source,{document,window,location:{pathname,origin:'https://roamark.onrender.com',hostname:'roamark.onrender.com'},localStorage:{getItem:()=>choice,setItem:(_,v)=>choice=v}});
 return {head,body,buttons,window};
}
test('Analytics waits for acceptance; rejection and withdrawal disable measurement',()=>{
 const state=boot();assert.equal(state.head.filter(t=>t.src).length,0);
 state.buttons[0].onclick();assert.equal(state.head.filter(t=>t.src).length,0);
 state.buttons[1].onclick();assert.equal(state.head.filter(t=>t.src).length,1);
 state.buttons[1].onclick();assert.equal(state.head.filter(t=>t.src).length,1);
 const event=state.window.dataLayer.find(args=>args[0]==='event');
 assert.equal(event[2].page_location,'https://roamark.onrender.com/places/rishikesh/');
 assert.equal(event[2].page_referrer,'');
 state.buttons[0].onclick();assert.equal(state.window['ga-disable-G-VN6QQXWDF5'],true);
 state.buttons[1].onclick();assert.equal(state.window['ga-disable-G-VN6QQXWDF5'],false);
 assert.equal(state.head.filter(t=>t.src).length,1);
});
test('Saved consent loads Analytics only on public browsing pages',()=>{
 assert.equal(boot('accepted').head.filter(t=>t.src).length,1);
 for(const path of ['/profile/','/admin/','/review/'])assert.equal(boot('accepted',path).head.filter(t=>t.src).length,0);
 assert.equal(boot('rejected').head.filter(t=>t.src).length,0);
});
