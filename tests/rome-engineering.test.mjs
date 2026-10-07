import assert from 'node:assert/strict';
import {BRIDGE_DECK,BRIDGE_APPROACH,bridgeDeckAt,streetHeight,channelHeight} from '../rome-engineering-plan.js';
import {BRIDGES,AQUEDUCT,createCityPlan,landmarkContains} from '../rome-city-layout.js';
const local=(b,u,v=0)=>[b.x+u*Math.cos(b.angle)+v*Math.sin(b.angle),b.z-u*Math.sin(b.angle)+v*Math.cos(b.angle)];
for(const b of BRIDGES){
 assert.equal(bridgeDeckAt(...local(b,0),b),BRIDGE_DECK);
 assert.equal(bridgeDeckAt(...local(b,0,b.d/2+.01),b),null);
 for(const side of [-1,1]){
  let prev=BRIDGE_DECK;
  for(let d=0;d<BRIDGE_APPROACH;d+=.1){
   const p=local(b,side*(b.w/2+d)),h=bridgeDeckAt(...p,b);
   assert(h<=prev+1e-10&&h>=.12);
   assert(Math.abs(h-prev)<.05,'No steps on the approach');
   assert(Math.abs(streetHeight(...p,BRIDGES,0)-h)<1e-10);
   prev=h;
  }
  assert.equal(bridgeDeckAt(...local(b,side*(b.w/2+BRIDGE_APPROACH+.01)),b),null);
 }
}
const plan=createCityPlan();
for(const b of plan.buildings)for(const bridge of BRIDGES)
 assert(!landmarkContains([b.x,b.z],{...bridge,w:bridge.w+2*BRIDGE_APPROACH},b.r+.5));
const length=Math.hypot(AQUEDUCT[1][0]-AQUEDUCT[0][0],AQUEDUCT[1][1]-AQUEDUCT[0][1]);
assert(channelHeight(length)>channelHeight(0));
assert(Math.abs((channelHeight(length)-channelHeight(0))/length-.006)<1e-10,'Preserve a gentle gradient even when extending the channel');
assert(length>160&&length<180,'Extend the old 114-unit arcade by roughly half');
const spans=Math.ceil(length/6.3);
assert.equal(spans,28);
assert(length/spans<=6.3,'Do not stretch arch openings to extend the channel');
console.log('PASS: bridge deck/ramp continuity, shared travel elevation, approach clearance and aqueduct grade.');

const {gradedBoxGeometry,archWallGeometry}=await import('../rome-structure-geometry.js');
const THREE=await import('../assets/vendor/three.module.min.js');
const {bathCoping}=await import('../rome-bath-plan.js');
for(const grade of [-.4475,.006,.4475]){
 const g=gradedBoxGeometry(8,1,2,grade),p=g.attributes.position;
 for(let i=0;i<p.count;i++)assert(Math.abs(Math.abs(p.getY(i)-grade*p.getX(i))-.5)<1e-6);
 g.dispose();
}
// The underside of the arch contains no solid triangles at the opening centre.
for(const args of [[6.4,7.4,.35,5.2,3.45],[6.3,2,4.4,5.05,8,.006]]){
 const g=archWallGeometry(...args),p=g.attributes.position;
 for(let i=0;i<p.count;i++)assert(Number.isFinite(p.getX(i))&&Number.isFinite(p.getY(i))&&Number.isFinite(p.getZ(i)));
 const material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide}),mesh=new THREE.Mesh(g,material);
 mesh.updateMatrixWorld(true);
 const ray=new THREE.Raycaster(new THREE.Vector3(0,args[2]+args[3]*.2,20),new THREE.Vector3(0,0,-1));
 assert.equal(ray.intersectObject(mesh).length,0,'The arch opening must be empty geometry');
 ray.ray.origin.x=(args[0]+args[3])/4;
 assert(ray.intersectObject(mesh).length>0,'The arch must retain solid side piers');
 material.dispose();
 g.computeBoundingBox();assert(g.boundingBox.min.y===0);
 assert(g.boundingBox.max.y>args[2]+args[3]/2);
 g.dispose();
}
assert.throws(()=>archWallGeometry(6,2,4,5,6),RangeError);
for(const [w,d] of [[75,60],[62,51]]){
 const rims=bathCoping(w,d);
 for(let i=0;i<rims.length;i++)for(const b of rims.slice(i+1)){
  const a=rims[i];
  const overlapX=(a.w+b.w)/2-Math.abs(a.u-b.u),overlapZ=(a.d+b.d)/2-Math.abs(a.v-b.v);
  assert(overlapX<1e-9||overlapZ<1e-9,'Coping top faces must not overlap');
 }
}
console.log('PASS: graded mesh vertices, valid open arch geometry and non-overlapping bath coping.');

for(let i=0;i<spans;i++){
 const span=length/spans,g=archWallGeometry(span,2,4.4,span-1.25,channelHeight((i+.5)*span)-.2,.006);
 for(const value of g.attributes.position.array)assert(Number.isFinite(value));g.dispose();
}
console.log('PASS: 28 constructible aqueduct spans preserve gravity grade over the extended alignment.');
