import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {CITY_BOUNDARY,RIVER,RIVER_WIDTH,LANDMARKS,ROADS,AQUEDUCT,createCityPlan,inside,pathDistance,landmarkContains,footprintsOverlap,footprintMeetsPath,heightAt} from '../rome-city-layout.js';

const read=name=>readFile(new URL(`../${name}`,import.meta.url),'utf8');
const [html,scene,page,lab]=await Promise.all(['rome-city.html','rome-city-scene.js','rome-city-page.js','ai-lab.html'].map(read));
assert(html.includes('rome-city-body'));
assert(html.includes('rome-city-page.js'));
assert(html.includes('ai-lab.html#rome-experiment'));
assert(html.includes('data-en-label="Back to AI Creative Lab"'));
for(const old of ['town-heading','town-story','town-footer'])assert(!html.includes(old));
for(const id of ['town-game','town-loading','town-error','scene-pause','vehicle-card','lang-toggle'])assert(html.includes(`id="${id}"`));
assert(scene.includes('WebGLRenderer'));
assert(scene.includes('OrthographicCamera'));
assert(scene.includes('Raycaster'));
assert(scene.includes('AbortController'));
assert(scene.includes('renderer.dispose()'));
assert(page.includes('rome-language-change'));
assert(lab.includes('assets/rome-current-city-cover.jpg'));
assert.equal((lab.match(/href="rome-city.html"/g)||[]).length,2);
assert(!lab.toLowerCase().includes('chengdu'));
for(const name of ['assets/vendor/three.module.min.js','assets/rome-current-city-cover.jpg'])await access(new URL(`../${name}`,import.meta.url));

const plan=createCityPlan();
// Expanded irregular urban fabric reserves all monument and road footprints.
assert(plan.buildings.length>=1300,`Expected a dense city; got ${plan.buildings.length}`);
assert.deepEqual(plan,createCityPlan(),'Seeded city plan must be stable');
assert.notDeepEqual(plan.buildings,createCityPlan(311).buildings);
assert(CITY_BOUNDARY.length>8,'City must not be a square grid');
assert(Math.max(...CITY_BOUNDARY.map(p=>p[0]))-Math.min(...CITY_BOUNDARY.map(p=>p[0]))>450);
assert(Math.max(...CITY_BOUNDARY.map(p=>p[1]))-Math.min(...CITY_BOUNDARY.map(p=>p[1]))>500);
assert.equal(LANDMARKS.length,13);
const byId=id=>LANDMARKS.find(m=>m.id===id);
assert(byId('pantheon').x<byId('forum').x&&byId('pantheon').z<byId('forum').z);
assert(byId('colosseum').x>byId('forum').x);
assert(byId('circus').z>byId('palatine').z);
assert(byId('caracalla').z>byId('circus').z);
assert(byId('trajan').z<byId('forum').z);

function corners(m){return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sz])=>{const u=sx*m.w/2,v=sz*m.d/2;return [m.x+u*Math.cos(m.angle)+v*Math.sin(m.angle),m.z-u*Math.sin(m.angle)+v*Math.cos(m.angle)];});}
function overlaps(a,b){return [a.angle,b.angle].flatMap(t=>[[Math.cos(t),-Math.sin(t)],[Math.sin(t),Math.cos(t)]]).every(axis=>{const x=corners(a).map(p=>p[0]*axis[0]+p[1]*axis[1]),y=corners(b).map(p=>p[0]*axis[0]+p[1]*axis[1]);return Math.min(...x)<Math.max(...y)&&Math.max(...x)>Math.min(...y);});}
for(let i=0;i<LANDMARKS.length;i++){
 const m=LANDMARKS[i],p=corners(m);
 for(let j=0;j<4;j++)for(let k=0;k<=30;k++){const a=p[j],b=p[(j+1)%4],q=[a[0]+(b[0]-a[0])*k/30,a[1]+(b[1]-a[1])*k/30];assert(pathDistance(q,RIVER)>RIVER_WIDTH/2,`${m.id} intrudes into river`);}
 for(const other of LANDMARKS.slice(i+1))assert(!overlaps(m,other),`${m.id} overlaps ${other.id}`);
}
for(let i=0;i<plan.buildings.length;i++){
 const b=plan.buildings[i],p=[b.x,b.z];
 assert(inside(p));
 assert(pathDistance(p,RIVER)>RIVER_WIDTH/2+b.r+3);
 assert(pathDistance(p,AQUEDUCT)>b.r+2);
 assert(pathDistance(p,[...CITY_BOUNDARY,CITY_BOUNDARY[0]])>b.r+4);
 assert(!LANDMARKS.some(m=>landmarkContains(p,m,b.r+1.8)));
 assert(!plan.streets.some(r=>footprintMeetsPath(b,r.points,r.width/2+.5)));
 for(const other of plan.buildings.slice(i+1))assert(!footprintsOverlap(b,other,.549));
}
for(const road of ROADS)for(let i=1;i<road.points.length;i++){
 const a=road.points[i-1],b=road.points[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1]));
 for(let j=0;j<=n;j++){const p=[a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n];assert(!LANDMARKS.some(m=>landmarkContains(p,m,road.width/2)),`${road.en} crosses a monument`);}
}
console.log(`PASS: ${plan.buildings.length} buildings, ${LANDMARKS.length} monuments, deterministic layout, river/road/monument clearances, page wiring.`);

// Prevent the two different venues from reverting to duplicate racing circuits.
const {venuePlan}=await import('../rome-venue-plan.js');
const circus=venuePlan(byId('circus')),stadium=venuePlan(byId('stadium'));
assert.equal(LANDMARKS.filter(m=>m.type==='circus').length,1);
assert.equal(circus.use,'chariot-racing');
assert(Math.abs(circus.length/circus.width-600/140)<1e-10);
assert.equal(circus.length/600,stadium.length/275);
assert.equal(circus.startingGates,12);
assert.equal(circus.spina,true);
assert.equal(circus.turningPosts,6);
assert.equal(stadium.use,'athletics');
assert.equal(stadium.spina,false);
assert.equal(stadium.obelisk,false);
assert.equal(stadium.startingGates,0);
assert.equal(stadium.turningPosts,0);
assert.equal(stadium.roundedEnds,1);
assert(Math.abs(stadium.length/stadium.width-275/106)<1e-10);
assert(html.includes('data-landmark="stadium"'));
assert(scene.includes('if(venue.spina)'));
assert(scene.includes('if(venue.startingGates)'));
console.log('PASS: Circus Maximus and Stadium of Domitian have distinct historically grounded plans.');

// The reference is an extended urban fabric, not circular quarter islands.
const turnSigns=CITY_BOUNDARY.map((p,i,a)=>{const q=a[(i+1)%a.length],r=a[(i+2)%a.length];return Math.sign((q[0]-p[0])*(r[1]-q[1])-(q[1]-p[1])*(r[0]-q[0]));});
assert(turnSigns.includes(-1)&&turnSigns.includes(1),'Perimeter must retain its concave salients');
assert(CITY_BOUNDARY.length>=30);
assert(plan.buildings.reduce((sum,b)=>sum+b.w*b.d,0)>60000,'Continuous built fabric, not sparse dots');
assert(plan.buildings.filter(b=>b.style===4).length>=20,'Include open-courtyard blocks');
assert(plan.buildings.filter(b=>b.z<-280).length>60,'Northward urban extension');
assert(plan.buildings.filter(b=>b.x>240).length>40,'Eastern salient must contain real streets and buildings');
console.log('PASS: asymmetric concave perimeter, north/east extensions, dense block frontages and courtyard housing.');

const spanX=Math.max(...CITY_BOUNDARY.map(p=>p[0]))-Math.min(...CITY_BOUNDARY.map(p=>p[0]));
const spanZ=Math.max(...CITY_BOUNDARY.map(p=>p[1]))-Math.min(...CITY_BOUNDARY.map(p=>p[1]));
assert(spanZ/spanX>1.3,'Northern extension must not collapse back into a round city');

assert(heightAt(byId('colosseum').x,byId('colosseum').z)<1,'Colosseum remains in the valley, outside the palace plateau');
