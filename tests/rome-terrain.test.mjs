import assert from 'node:assert/strict';
import {LANDMARKS,heightAt,naturalHeightAt,MONUMENT_TERRAIN_APRON} from '../rome-city-layout.js';
const world=(m,u,v)=>[m.x+u*Math.cos(m.angle)+v*Math.sin(m.angle),m.z-u*Math.sin(m.angle)+v*Math.cos(m.angle)];
const forum=LANDMARKS.find(m=>m.id==='forum'),regression=world(forum,19.5,13);
// This was covered by a 7-unit palace slope before grading and precinct spacing.
// Keep the original world-space regression point after the palace is relocated.
assert.equal(heightAt(...regression),heightAt(forum.x,forum.z),'Forum must no longer be buried by the Palatine slope');
assert(MONUMENT_TERRAIN_APRON>Math.hypot(4,4),'Apron must protect full terrain grid diagonals');
for(const m of LANDMARKS){
 const datum=heightAt(m.x,m.z);
 assert.equal(datum,naturalHeightAt(m.x,m.z),'Preserve original monument base heights');
 for(let u=-m.w/2;u<=m.w/2;u+=1)for(let v=-m.d/2;v<=m.d/2;v+=1){
  const [x,z]=world(m,u,v);
  assert(heightAt(x,z)<=datum+1e-9,`${m.id}: terrain intrudes into its architectural pad`);
  // Exact x/z lattice of the rendered 900 x 1220, 225 x 305 grid, shifted -140.
  // Both triangles in this cell are bounded by these four corner elevations.
  const gx=Math.floor((x+450)/4)*4-450,gz=Math.floor((z+750)/4)*4-750;
  for(const dx of [0,4])for(const dz of [0,4])assert(heightAt(gx+dx,gz+dz)<=datum+1e-9,`${m.id}: a terrain triangle can cover the foundation`);
 }
}
for(let x=-280;x<=340;x+=7)for(let z=-350;z<=270;z+=7){
 const h=heightAt(x,z);assert(Number.isFinite(h)&&h>=0);assert(h<=naturalHeightAt(x,z)+1e-9,'Grading must not raise the landscape');
}
assert.equal(heightAt(250,-200),naturalHeightAt(250,-200),'Remote landscape is unchanged');
console.log('PASS: all 13 monument pads and supporting terrain triangles clear; Forum burial regression; base elevations preserved.');
