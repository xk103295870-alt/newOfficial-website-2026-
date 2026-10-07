import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createCityPlan,LANDMARKS,landmarkContains} from '../rome-city-layout.js';
import {createLifePlan,sampleWalk,personMotion,plantSafe,pedestrianSafe} from '../rome-city-life.js';
const city=createCityPlan(),life=createLifePlan(city);
assert.deepEqual(life,createLifePlan(city));
assert.equal(life.plants.length,1050);
assert.equal(life.people.length,660);
assert.equal(new Set(life.plants.map(p=>p.kind)).size,4);
for(let i=0;i<life.plants.length;i++){
 const p=life.plants[i];assert(plantSafe([p.x,p.z],p.r,city));
 for(const q of life.plants.slice(i+1))assert(Math.hypot(p.x-q.x,p.z-q.z)>=p.r+q.r+1.4);
}
for(const path of life.paths){
 assert(path.length>12);
 for(let d=0;d<path.length*2;d+=2){
  const p=sampleWalk(path,d);assert(pedestrianSafe([p.x,p.z],city));assert(Number.isFinite(p.y)&&Number.isFinite(p.angle));
  assert(!LANDMARKS.some(m=>landmarkContains([p.x,p.z],m,.5)));
 }
 for(const end of [0,path.length,path.length*2]){
  const a=sampleWalk(path,end-.001),b=sampleWalk(path,end+.001);
  assert(Math.hypot(a.x-b.x,a.z-b.z)<.003,'No teleport when reversing direction');
 }
}
for(const person of life.people){
 const path=life.paths[person.path];assert(path);
 const a=sampleWalk(path,person.start),b=sampleWalk(path,person.start+person.speed);
 const mid=sampleWalk(path,person.start+person.speed*.5);
 assert(Math.hypot(a.x-mid.x,a.z-mid.z)+Math.hypot(mid.x-b.x,mid.z-b.z)>.01,'Each pedestrian must move, including a turn-and-return interval');
 assert.deepEqual(sampleWalk(path,person.start),a,'Sampling a paused distance must remain stable');
}
const source=await readFile(new URL('../rome-city-scene.js',import.meta.url),'utf8');
assert(source.includes('THREE.InstancedMesh'));
assert(source.includes('if(!paused)crowdTime+=dt'));
assert(source.includes('for(const mesh of crowdBatches)mesh.dispose()'));
assert(source.includes("m.id==='caracalla'"));
assert(source.includes('if(caracalla)'));
assert(!source.includes("if(m.type==='baths')for(const side"),'Remove the old generic temple/dome bath renderer');
console.log(`PASS: ${life.plants.length} collision-checked plants, ${life.people.length} walkers on ${life.paths.length} safe paths; reversal, pause and cleanup.`);
const {bathLevels}=await import('../rome-bath-plan.js');
for(const base of [.18,2,7,100]){
 const {podiumTop,floor,water,copingTop}=bathLevels(base);
 assert(floor>podiumTop);
 assert(water-podiumTop>.09,'Water needs a real depth gap, not only polygon offset');
 assert(water>floor&&water<copingTop);
}
assert(source.includes('levels.water'));
assert(source.includes('new THREE.PlaneGeometry(w*.30,d*.16)'));
assert(!source.includes('w*.30,d*.16,.15,base+.05'));
console.log('PASS: bath pool surface is above the podium and below its rim, without coplanar faces.');

assert.equal(life.paths.filter(p=>p.loop).length,5);
assert(life.plants.filter(p=>p.plaza).length>=16);
for(const role of ['soldier','noble','merchant','resident'])assert.equal(life.people.filter(p=>p.role===role).length,165);
assert(life.people.filter(p=>life.paths[p.path].civic).length>=480);
for(const p of life.people){
 for(const t of [0,1,10,50,500]){
  const a=personMotion(p,t),b=personMotion(p,t+.001);
  assert(b.distance>=a.distance&&b.distance-a.distance<=p.speed*.00101);
  assert.deepEqual(personMotion(p,t),a);
 }
 const t=p.activeFor+p.restFor*.5+p.activeFor+p.restFor-p.offset;
 assert(!personMotion(p,t).moving);
 assert.equal(personMotion(p,t).distance,personMotion(p,t+.1).distance);
}
console.log('PASS: four roles, five obstacle-checked plaza loops, 480+ civic walkers, continuous activity/rest cycles.');

assert(life.plants.filter(p=>p.plaza).length>=35,'Tree-lined squares, not four isolated corner trees');
assert(life.plants.filter(p=>p.grove).length>=35,'Plant the central garden gaps');
