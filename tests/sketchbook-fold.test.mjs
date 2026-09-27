import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../sketchbook-fold.js',import.meta.url),'utf8');
const {foldGeometry,constrainCorner}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const W=1200,H=750;
const area=poly=>Math.abs(poly.reduce((a,p,i)=>{const q=poly[(i+1)%poly.length];return a+p.x*q.y-p.y*q.x;},0)/2);
let cases=0;
for(const corner of ['top','bottom']) {
 const cy=corner==='top'?0:H;
 for(const x of [0,60,350,600,900,1152,1198]) {
  for(const offset of [0,40,190,500,-200]) {
   const p={x,y:cy+(corner==='top'?1:-1)*offset};
   const f=foldGeometry(p,W,H,corner);assert.ok(f);
   assert.ok(Math.abs(area(f.front)+area(f.flap)-W/2*H)<.01,'front + flap preserve paper area');
   assert.ok(Math.abs(area(f.back)-area(f.flap))<.01,'reflection preserves flap area');
   const reflected=f.reflect({x:W,y:cy});
   assert.ok(Math.hypot(reflected.x-f.point.x,reflected.y-f.point.y)<.001,'corner follows constrained pointer');
   const original=f.reflect(reflected);
   assert.ok(Math.hypot(original.x-W,original.y-cy)<.001,'reflection is invertible');
   assert.ok(Math.hypot(f.point.x-W/2,f.point.y-cy)<=W/2+.001,'page cannot stretch off binding');
   for(const p of [...f.front,...f.back]) assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
   cases++;
  }
 }
 const final=foldGeometry({x:0,y:cy},W,H,corner);
 assert.ok(area(final.front)<.01);
 assert.ok(Math.abs(area(final.back)-W/2*H)<.01);
 assert.ok(final.back.every(p=>p.x>=-.01&&p.x<=W/2+.01));
}
assert.equal(foldGeometry({x:W,y:H},W,H),null);
assert.ok(constrainCorner({x:-500,y:2000},W,H,'bottom').x>=0);
console.log(`PASS: ${cases} corner positions; clipping, reflection, binding limits, endpoints.`);
