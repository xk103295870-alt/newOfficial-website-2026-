import assert from 'node:assert/strict';
import {CIVIC_STREETS,CIVIC_BLOCKS,inCivicPrecinct} from '../rome-civic-plan.js';
import {createCityPlan,LANDMARKS,landmarkContains,pathDistance,footprintsOverlap} from '../rome-city-layout.js';
const plan=createCityPlan();
assert.equal(CIVIC_STREETS.length,8,'Keep a small, explicit civic street network');
// Connectivity includes T-junctions along another polyline, not only shared ends.
const reached=new Set([0]);let changed=true;
while(changed){changed=false;for(let i=0;i<CIVIC_STREETS.length;i++)if(!reached.has(i))for(const j of reached){
 if(CIVIC_STREETS[i].points.some(p=>pathDistance(p,CIVIC_STREETS[j].points)<.01)||CIVIC_STREETS[j].points.some(p=>pathDistance(p,CIVIC_STREETS[i].points)<.01)){reached.add(i);changed=true;break;}
}}
assert.equal(reached.size,CIVIC_STREETS.length,'Civic streets form a connected network');
for(const r of CIVIC_STREETS){
 assert(r.width>=3.4&&r.width<=4.2);
 for(let i=1;i<r.points.length;i++){
  const a=r.points[i-1],b=r.points[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);assert(len>=10,'No tiny jitter segments');
  for(let j=0;j<=Math.ceil(len*2);j++){
   const t=j/Math.ceil(len*2),p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
   assert(!LANDMARKS.some(m=>landmarkContains(p,m,r.width/2+1.49)),`${r.id}: clear architectural forecourts`);
  }
 }
}
for(const r of plan.streets.filter(r=>!r.civic&&!r.civicEntry&&!r.bridge))for(const p of r.points)assert(!inCivicPrecinct(p),'No procedural lanes/shortcuts inside the curated core');
const housing=plan.buildings.filter(b=>inCivicPrecinct([b.x,b.z]));
assert(housing.length>=110&&housing.length<230);
for(const b of housing)assert(CIVIC_BLOCKS.some(block=>block.id===b.block),'All core houses belong to a planned group');
for(const block of CIVIC_BLOCKS)assert(housing.some(b=>b.block===block.id),`${block.id} is populated`);
const palace=LANDMARKS.find(m=>m.id==='palatine'),forum=LANDMARKS.find(m=>m.id==='forum');
assert(!footprintsOverlap(palace,forum,5),'Leave space for the Sacred Way between forum and palace');
console.log(`PASS: 8 connected civic streets, reserved forecourts, no random core lanes, ${housing.length} grouped homes; palace/forum passage clear.`);

const {CIVIC_PLAZAS,CIVIC_ACCESS}=await import('../rome-civic-plan.js');
const {PUBLIC_FIXTURES,PLAZA_LOOPS}=await import('../rome-public-space-plan.js');
assert.equal(CIVIC_PLAZAS.length,5);
for(const p of CIVIC_PLAZAS){
 assert(!plan.buildings.some(b=>footprintsOverlap(b,p,.99)),'Reserve each public square before placing homes');
 assert(!LANDMARKS.some(b=>footprintsOverlap(b,p,0)),'Squares do not overlap monuments');
 assert(PUBLIC_FIXTURES.some(f=>f.plaza===p.id));
 assert(PLAZA_LOOPS.some(l=>l.plaza===p.id));
}
for(const r of CIVIC_ACCESS){
 assert(r.pedestrianOnly);
 assert(plan.streets.includes(r));
 for(let t=0;t<=1;t+=.02){const [a,b]=r.points,p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  assert(!LANDMARKS.some(m=>landmarkContains(p,m,r.width/2)));
  assert(!plan.buildings.some(m=>landmarkContains(p,m,r.width/2)));
 }
}
console.log('PASS: five reserved furnished squares, connected pedestrian-only approaches, no building obstruction.');

assert(plan.plazas.find(p=>p.id==='market').w*plan.plazas.find(p=>p.id==='market').d>=1200,'Main square must be a large public space, not a small courtyard');
assert.equal(plan.lawns.length,6);
for(const lawn of plan.lawns)assert(!plan.buildings.some(b=>footprintsOverlap(b,lawn,.99)));
