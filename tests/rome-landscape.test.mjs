import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {samplePolyline,roundRiver,ribbonSections,offsetPoint,riverTerrainHeight,stripPositions} from '../rome-landscape-plan.js';
import {RIVER,RIVER_WIDTH,LANDMARKS,BRIDGES,createCityPlan,pathDistance,landmarkContains,inside} from '../rome-city-layout.js';
import {BRIDGE_APPROACH} from '../rome-engineering-plan.js';
const river=roundRiver(RIVER),sections=ribbonSections(river);
assert.deepEqual(river[0],RIVER[0]);assert.deepEqual(river.at(-1),RIVER.at(-1));
for(const p of river)assert(pathDistance(p,RIVER)<1.5,'Rounding must remain in the reserved river corridor');
for(const s of sections){
 assert(s.n.every(Number.isFinite));
 assert(Math.hypot(...s.n)<1.7,'No unbounded spikes at bends');
 for(const side of [-1,1]){
  const edge=offsetPoint(s,side*RIVER_WIDTH/2);
  assert(!LANDMARKS.some(m=>landmarkContains(edge,m)), 'River rounding must not enter monuments');
 }
}
for(const points of [[[0,0],[10,0],[10,10]],[[0,0],[1,0],[1,0],[10,0]],[[0,0],[10,0],[9,1]]]){
 const sample=samplePolyline(points,.8),cross=ribbonSections(sample);
 assert.deepEqual(sample[0],points[0]);assert.deepEqual(sample.at(-1),points.at(-1));
 const mesh=stripPositions(cross,-2,2,p=>.08+p[0]*.01);
 assert(mesh.every(Number.isFinite));
 for(let i=1;i<cross.length-1;i++){
  const previous=(i-1)*18,next=i*18;
  assert.deepEqual(mesh.slice(previous+15,previous+18),mesh.slice(next,next+3),'Left edges must share an identical endpoint');
  assert.deepEqual(mesh.slice(previous+6,previous+9),mesh.slice(next+3,next+6),'Right edges must share an identical endpoint');
 }

}
assert(riverTerrainHeight(0,-.12)<-.43,'Riverbed must lie below water');
assert.equal(riverTerrainHeight(11,-.12),-.12);
for(let d=8;d<11;d+=.05)assert(riverTerrainHeight(d+.05,-.12)>=riverTerrainHeight(d,-.12));
const plan=createCityPlan(),bridges=plan.streets.filter(s=>s.bridge),links=plan.streets.filter(s=>s.connector);
assert.equal(bridges.length,BRIDGES.length);assert(links.length>0);
for(const b of bridges)for(const p of [b.points[0],b.points.at(-1)])
 assert(plan.streets.some(s=>s!==b&&pathDistance(p,s.points)<.5),'Every bridge ramp must connect to a road');
for(const road of links){
 const points=samplePolyline(road.points,.5);
 for(const p of points){
  assert(inside(p));
  assert(!LANDMARKS.some(m=>landmarkContains(p,m,road.width/2+1.49)));
  assert(pathDistance(p,RIVER)>=RIVER_WIDTH/2+road.width/2+.99||BRIDGES.some(b=>landmarkContains(p,{...b,w:b.w+2*BRIDGE_APPROACH},-road.width/2)));
 }
}
const source=await readFile(new URL('../rome-city-scene.js',import.meta.url),'utf8');
assert(source.includes('pavingTexture.dispose()')&&source.includes('flowMaterial.dispose()'));
assert(source.includes('if(!paused)flowTime+=dt'));
assert(!source.includes('function ribbon('),'Remove disconnected per-segment rectangles');
console.log(`PASS: continuous river/road cross-sections, confined river bends, carved bed, ${links.length} collision-checked road links, all bridge approaches connected, animation pause and cleanup.`);
