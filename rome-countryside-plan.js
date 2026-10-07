import {CITY_BOUNDARY,RIVER,RIVER_WIDTH,AQUEDUCT,AQUEDUCT_NODES,landmarkContains,ROADS,RURAL_VILLAGES,GATE_NETWORK,inside,pathDistance} from './rome-city-layout.js';
// Broad asymmetric landscape, independent of the city wall (not a scaled ring).
export const COUNTRY_BOUNDARY=[[-361,-601],[-216,-641],[54,-627],[238,-547],[398,-289],[425,-39],[346,266],[215,374],[23,358],[-171,296],[-321,170],[-374,-42]];
export const COUNTRY_RIVER=[[-188,-650],[-175,-505],...RIVER,[-274,337],[-312,410]];

const wall=[...CITY_BOUNDARY,CITY_BOUNDARY[0]],edge=[...COUNTRY_BOUNDARY,COUNTRY_BOUNDARY[0]];
const project=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz)));return [a[0]+dx*t,a[1]+dz*t];};
export function outsideSafe(p,r=0){
 return inside(p,COUNTRY_BOUNDARY)&&!inside(p)&&pathDistance(p,wall)>r+8&&pathDistance(p,edge)>r+6&&pathDistance(p,COUNTRY_RIVER)>RIVER_WIDTH/2+r+4&&pathDistance(p,AQUEDUCT)>r+5&&!AQUEDUCT_NODES.some(n=>landmarkContains(p,n,r+1));
}
export function createCountrysidePlan(seed=807){
 let state=seed;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
 const villages=RURAL_VILLAGES.map(v=>({...v})),roads=GATE_NETWORK.roads.map(r=>({...r,points:r.points.map(p=>[...p])})),gates=GATE_NETWORK.gates.map(g=>({...g}));
 // Carry the village street through the settlement instead of making every
 // house drive terminate at one central point (a radial/star-shaped layout).
 for(const road of roads){const a=road.points.at(-2),b=road.points.at(-1),length=Math.hypot(b[0]-a[0],b[1]-a[1]);road.points.push([b[0]+(b[0]-a[0])*28/length,b[1]+(b[1]-a[1])*28/length]);}
 const houses=[],fields=[],trees=[],lanes=[];
 const clear=(p,r)=>outsideSafe(p,r)&&!roads.some(s=>pathDistance(p,s.points)<r+s.width/2+1)&&!houses.some(h=>Math.hypot(p[0]-h.x,p[1]-h.z)<r+h.r+2);
 for(const v of villages){
  for(let attempt=0,count=0;attempt<1500&&count<14;attempt++){
   const x=v.x+(random()-.5)*52,z=v.z+(random()-.5)*50,w=3.8+random()*3,d=4+random()*3.2,r=Math.hypot(w,d)/2;
   if(!clear([x,z],r))continue;
   if(lanes.some(s=>pathDistance([x,z],s.points)<r+1))continue;
   const nearby=[];for(const road of roads)for(let i=1;i<road.points.length;i++){const q=project([x,z],road.points[i-1],road.points[i]);nearby.push(q);}
   nearby.sort((a,b)=>Math.hypot(a[0]-x,a[1]-z)-Math.hypot(b[0]-x,b[1]-z));
   const q=nearby[0],route=[[x,z],q];
   if(houses.some(h=>pathDistance([h.x,h.z],route)<h.r+1))continue;
   houses.push({x,z,w,d,r,h:2.3+random()*1.4,angle:v.angle+(random()-.5)*.25,village:v.id,barn:count===0});
   lanes.push({width:1.15,points:route});count++;
  }
 }
 const allRoads=[...roads,...lanes];
 for(let attempt=0;attempt<16000&&fields.length<42;attempt++){
  const x=-365+random()*785,z=-620+random()*980,w=17+random()*22,d=14+random()*19,r=Math.hypot(w,d)/2,angle=(Math.round(random()*5)-2)*.19;
  if(!clear([x,z],r)||allRoads.some(s=>pathDistance([x,z],s.points)<r+s.width/2+1))continue;
  if(fields.some(f=>Math.hypot(x-f.x,z-f.z)<r+f.r+3))continue;
  if(Math.min(...roads.map(s=>pathDistance([x,z],s.points)))>100)continue;
  fields.push({x,z,w,d,r,angle,kind:['grain','furrows','orchard','vines'][fields.length%4]});
 }
 for(let i=0;i<7000&&trees.length<150;i++){
  const x=-365+random()*785,z=-620+random()*980,r=1.5;
  if(!clear([x,z],r)||allRoads.some(s=>pathDistance([x,z],s.points)<r+s.width/2+1)||fields.some(f=>Math.hypot(x-f.x,z-f.z)<f.r+r+2)||trees.some(t=>Math.hypot(x-t.x,z-t.z)<4))continue;
  trees.push({x,z,scale:.75+random()*.5});
 }
 return {villages,roads,lanes,gates,houses,fields,trees};
}
