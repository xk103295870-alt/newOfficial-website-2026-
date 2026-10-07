import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../assets/vendor/three.module.min.js';
import {LANDMARKS} from '../rome-city-layout.js';
import {COLOSSEUM_DETAIL,curvedArcadeBay,drawColosseum,drawTheatre,drawTemple,drawForum,drawPalace,detailBaths,detailVenue} from '../rome-architecture.js';
import {venuePlan} from '../rome-venue-plan.js';
assert.equal(COLOSSEUM_DETAIL.bays,80);
assert.equal(COLOSSEUM_DETAIL.arcadeStoreys,3);
const theta=.1,g=curvedArcadeBay(20,16,0,.2,.7,3);
const material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
const mesh=new THREE.Mesh(g,material);mesh.updateMatrixWorld(true);
const origin=new THREE.Vector3(25*Math.cos(theta),1,21*Math.sin(theta));
const aim=new THREE.Vector3(20*Math.cos(theta),1,16*Math.sin(theta));
const ray=new THREE.Raycaster(origin,aim.sub(origin).normalize());
assert.equal(ray.intersectObject(mesh).length,0,'Arcade openings must be actual voids');
ray.ray.origin.y=2.98;assert(ray.intersectObject(mesh).length>0,'Arch spandrel must remain solid');
g.dispose();material.dispose();
let vertices=0,pieces=0,root;
const finite=values=>assert(values.every(Number.isFinite),'Finite model transforms');
const H={
 local(cx,cz,a,u,v){return [cx+u*Math.cos(a)+v*Math.sin(a),cz-u*Math.sin(a)+v*Math.cos(a)];},
 add(geo,x,y,z,a=0){
  finite([x,y,z,a]);const p=geo.attributes.position;
  for(let i=0;i<p.count;i++){finite([p.getX(i),p.getY(i),p.getZ(i)]);}
  geo.computeBoundingBox();const b=geo.boundingBox;
  for(const xx of [b.min.x,b.max.x])for(const zz of [b.min.z,b.max.z]){
   const world=H.local(x,z,a,xx,zz),dx=world[0]-root.x,dz=world[1]-root.z;
   const u=dx*Math.cos(root.angle)-dz*Math.sin(root.angle),v=dx*Math.sin(root.angle)+dz*Math.cos(root.angle);
   // Thin trim tolerance only, not permission to intrude into streets/houses.
   assert(Math.abs(u)<=root.w/2+1 && Math.abs(v)<=root.d/2+1,`${root.id}: geometry outside reserved footprint (${u.toFixed(2)},${v.toFixed(2)})`);
  }
  vertices+=p.count;pieces++;geo.dispose();
 },
 lbox(m,u,v,w,d,h,y=0){assert(w>0&&d>0&&h>0);const p=H.local(m.x,m.z,m.angle,u,v);H.add(new THREE.BoxGeometry(w,h,d),p[0],y+h/2,p[1],m.angle);},
 roof(m,w,d,h,y){finite([w,d,h,y]);},
 line(points){points.forEach(finite);},ring(...a){finite(a.filter(v=>typeof v==='number'));},
 ellipseBand(m,rx,rz,thickness,h,y){assert(rx>thickness&&rz>thickness&&h>0);finite([rx,rz,thickness,h,y]);},
};
for(const m of LANDMARKS){
 root=m;const args=[m,1,H];
 if(m.type==='arena')drawColosseum(...args);
 if(m.type==='theatre')drawTheatre(...args);
 if(m.type==='temple')drawTemple(...args);
 if(m.type==='forum')drawForum(...args);
 if(m.type==='palace')drawPalace(...args);
 if(m.type==='baths')detailBaths(...args);
 if(['circus','stadium'].includes(m.type)){const v=venuePlan(m);detailVenue({...m,angle:v.angle},v.length,v.width,1,H);}
}
assert(vertices<1600000,`Static detail geometry unexpectedly large: ${vertices}`);
const html=await readFile(new URL('../rome-city.html',import.meta.url),'utf8');
for(const m of LANDMARKS)assert(html.includes(`data-landmark="${m.id}"`),`${m.id} must be reachable`);
console.log(`PASS: open arcade raycast; all detailed landmarks finite and within footprints; ${pieces} merged parts / ${vertices} source vertices.`);
