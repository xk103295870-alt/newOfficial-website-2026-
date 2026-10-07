import assert from 'node:assert/strict';
import {createCountrysidePlan,outsideSafe,COUNTRY_BOUNDARY,COUNTRY_RIVER} from '../rome-countryside-plan.js';
import {createCityPlan,CITY_BOUNDARY,inside,pathDistance,AQUEDUCT} from '../rome-city-layout.js';
import {samplePolyline} from '../rome-landscape-plan.js';
const country=createCountrysidePlan(),city=createCityPlan();
assert.deepEqual(country,createCountrysidePlan());
assert.notDeepEqual(country.fields,createCountrysidePlan(808).fields);
assert.equal(country.villages.length,4);assert.equal(country.houses.length,56);assert.equal(country.fields.length,42);assert.equal(country.trees.length,150);
for(const v of country.villages)assert.equal(country.houses.filter(h=>h.village===v.id).length,14);
for(const item of [...country.houses,...country.fields]){
 assert(outsideSafe([item.x,item.z],item.r));
 for(const [u,v] of [[-1,-1],[1,-1],[1,1],[-1,1]]){
  const p=[item.x+u*item.w/2*Math.cos(item.angle)+v*item.d/2*Math.sin(item.angle),item.z-u*item.w/2*Math.sin(item.angle)+v*item.d/2*Math.cos(item.angle)];
  assert(!inside(p));assert(inside(p,COUNTRY_BOUNDARY));
 }
}
for(let i=0;i<country.fields.length;i++){
 const f=country.fields[i];
 for(const other of [...country.fields.slice(i+1),...country.houses])assert(Math.hypot(f.x-other.x,f.z-other.z)>f.r+other.r);
 for(const road of [...country.roads,...country.lanes])assert(pathDistance([f.x,f.z],road.points)>f.r+road.width/2);
}
for(const road of country.roads){
 for(const p of samplePolyline(road.points,.5)){
  assert(inside(p,COUNTRY_BOUNDARY),'Country road remains on the expanded terrain');
  assert(pathDistance(p,COUNTRY_RIVER)>8+road.width/2,'No unbridged river crossing');
  assert(pathDistance(p,AQUEDUCT)>road.width/2+2,'Keep aqueduct piers clear');
 }
 for(const h of city.buildings)assert(pathDistance([h.x,h.z],road.points)>h.r+road.width/2,'Do not route a gate road through existing houses');
}
for(const gate of country.gates){
 assert(pathDistance([gate.x,gate.z],[...CITY_BOUNDARY,CITY_BOUNDARY[0]])<1e-8);
 assert(country.roads.some(r=>pathDistance([gate.x,gate.z],r.points)<.01));
}
console.log('PASS: 4 villages / 56 houses, 42 varied fields, 150 rural trees; deterministic placement, wall/river/aqueduct clearances, existing homes protected, gate connections.');
