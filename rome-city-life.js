import {PUBLIC_FIXTURES,PUBLIC_TREES,PLAZA_LOOPS,plazaPoint} from './rome-public-space-plan.js';
import {inCivicPrecinct} from './rome-civic-plan.js';
import { streetHeight, BRIDGE_APPROACH } from './rome-engineering-plan.js';
import {CITY_BOUNDARY,CITY_EXTENT,RIVER,RIVER_WIDTH,LANDMARKS,BRIDGES,AQUEDUCT,AQUEDUCT_NODES,inside,pathDistance,landmarkContains,heightAt} from './rome-city-layout.js';

const boundary=[...CITY_BOUNDARY,CITY_BOUNDARY[0]];
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function rng(seed){let s=seed;return ()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}

// Conjectural landscape/life dressing, not archaeological vegetation or population data.
export function pedestrianSafe(p,plan){
 return inside(p)&&pathDistance(p,boundary)>1.1&&
  !LANDMARKS.some(m=>landmarkContains(p,m,.55))&&
  !plan.buildings.some(b=>landmarkContains(p,b,.65))&&
  !PUBLIC_FIXTURES.some(b=>landmarkContains(p,b,.55))&&
  !AQUEDUCT_NODES.some(b=>landmarkContains(p,b,1))&&
  !PUBLIC_TREES.some(t=>Math.hypot(p[0]-t.x,p[1]-t.z)<1.15)&&
  (pathDistance(p,RIVER)>RIVER_WIDTH/2+.7||BRIDGES.some(b=>landmarkContains(p,b,-.9)));
}
export function plantSafe(p,r,plan){
 return inside(p)&&pathDistance(p,boundary)>r+4&&
  pathDistance(p,RIVER)>RIVER_WIDTH/2+r+3.2&&pathDistance(p,AQUEDUCT)>r+2&&
  !BRIDGES.some(b=>landmarkContains(p,{...b,w:b.w+2*BRIDGE_APPROACH},r+.5))&&
  !LANDMARKS.some(m=>landmarkContains(p,m,r+2))&&
  !plan.buildings.some(b=>landmarkContains(p,b,r+.6))&&
  !PUBLIC_FIXTURES.some(b=>landmarkContains(p,b,r+.3))&&
  !AQUEDUCT_NODES.some(b=>landmarkContains(p,b,r+.5))&&
  !PLAZA_LOOPS.some(loop=>pathDistance(p,loop.points)<r+.6)&&
  !plan.streets.some(s=>pathDistance(p,s.points)<s.width/2+r+.8);
}
function pathRecord(points){
 const lengths=[0];for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+distance(points[i-1],points[i]));
 return {points,lengths,length:lengths.at(-1)};
}
export function createLifePlan(plan,seed=702){
 const random=rng(seed),plants=[],paths=[];
 let plantLimit=620;
 function plant(x,z,plaza=false,grove=false){
  if(plants.length>=plantLimit)return;
  if(!plaza&&!grove&&inCivicPrecinct([x,z])&&!plan.streets.some(road=>pathDistance([x,z],road.points)<road.width/2+5))return;
  const t=random(),kind=plaza?'cypress':t<.30?'cypress':t<.58?'pine':t<.83?'olive':'shrub';
  const scale=.8+random()*.4,r=({cypress:.85,pine:1.8,olive:1.45,shrub:.65})[kind]*scale;
  if(!plantSafe([x,z],r,plan)||plants.some(p=>Math.hypot(x-p.x,z-p.z)<r+p.r+1.4))return;
  plants.push({x,z,r,kind,scale,angle:random()*Math.PI*2,y:heightAt(x,z),plaza,grove});
 }
 for(const t of PUBLIC_TREES)plant(t.x,t.z,true);
 for(const lawn of plan.lawns)for(let u=-lawn.w/2+1.8;u<lawn.w/2-1.2;u+=3.8)for(let v=-lawn.d/2+1.8;v<lawn.d/2-1.2;v+=3.8){
  const [x,z]=plazaPoint(lawn,u,v);plant(x,z,false,true);
 }
 // Deliberate garden clusters occupy open corners without covering streets.
 for(const [x,z,rx,rz] of [[101,-101,14,12],[5,-74,10,7],[47,108,12,7]]){
  for(let u=-rx;u<=rx;u+=4.8)for(let v=-rz;v<=rz;v+=4.8)
   if((u/rx)**2+(v/rz)**2<1)plant(x+u,z+v,false,true);
 }
 // Roadside pockets first, then riverbank/garden/open-land infill.
 for(const street of plan.streets)for(let i=1;i<street.points.length;i++){
  const a=street.points[i-1],b=street.points[i],len=distance(a,b);if(!len)continue;
  const nx=-(b[1]-a[1])/len,nz=(b[0]-a[0])/len;
  for(let d=4;d<len;d+=9)for(const side of [-1,1]){const offset=(street.width/2+3)*side;plant(a[0]+(b[0]-a[0])*d/len+nx*offset,a[1]+(b[1]-a[1])*d/len+nz*offset);}
 }
 plantLimit=1050;
 for(let i=0;i<24000&&plants.length<plantLimit;i++)plant(CITY_EXTENT.minX+random()*(CITY_EXTENT.maxX-CITY_EXTENT.minX),CITY_EXTENT.minZ+random()*(CITY_EXTENT.maxZ-CITY_EXTENT.minZ));
 // Separate left/right walking lanes from the center of the cart routes.
 for(const street of plan.streets)for(const side of [-1,1]){
  let run=[];const flush=()=>{if(run.length>1){const path=pathRecord(run);if(path.length>12){path.civic=!!street.civic;paths.push(path);};}run=[];};
  for(let i=1;i<street.points.length;i++){
   const a=street.points[i-1],b=street.points[i],len=distance(a,b);if(!len)continue;
   const offset=(street.width/2-.48)*side,nx=-(b[1]-a[1])/len,nz=(b[0]-a[0])/len,n=Math.ceil(len/1.5);
   for(let j=0;j<=n;j++){
    const p=[a[0]+(b[0]-a[0])*j/n+nx*offset,a[1]+(b[1]-a[1])*j/n+nz*offset];
    if(!pedestrianSafe(p,plan)){flush();continue;}
    if(run.length){const prev=run.at(-1),d=distance(prev,p);if(d<.02)continue;
     if(d>3||!pedestrianSafe([(p[0]+prev[0])/2,(p[1]+prev[1])/2],plan))flush();}
    run.push(p);
   }
  }
  flush();
 }
 for(const loop of PLAZA_LOOPS){
  const path=pathRecord(loop.points);let safe=true;
  for(let d=0;d<path.length;d+=.35){const p=sampleWalk(path,d);if(!pedestrianSafe([p.x,p.z],plan)){safe=false;break;}}
  if(safe)paths.push({...path,loop:true,plaza:loop.plaza,civic:true});
 }
 const people=[],roles=['soldier','noble','merchant','resident'];
 const pools={plaza:[],civic:[],all:[]};paths.forEach((p,i)=>{pools.all.push(i);if(p.plaza)pools.plaza.push(i);else if(p.civic)pools.civic.push(i);});
 for(let i=0;i<660&&paths.length;i++){
  const pool=(i<180?pools.plaza:i<480?pools.civic:pools.all),available=pool.length?pool:pools.all;
  let pick=random()*available.reduce((n,j)=>n+paths[j].length,0),index=available.at(-1);
  for(const j of available){pick-=paths[j].length;if(pick<=0){index=j;break;}}
  const path=paths[index],role=roles[i%roles.length];
  const playing=!!path.plaza&&role==='resident'&&i%3===0;
  people.push({behavior:playing?'play':role==='soldier'?'patrol':role==='merchant'?'trade':role==='noble'?'stroll':'social',path:index,start:random()*path.length*(path.loop?1:2),speed:(playing?1.5:role==='soldier'?1.1:.7)+random()*.4,phase:random()*Math.PI*2,scale:(playing?.8:1.05)+random()*.25,tone:random(),role,
   activeFor:role==='soldier'?22:8+random()*9,restFor:role==='soldier'?2:3+random()*5,offset:random()*20});
 }
 return {plants,paths,people};
}
// Reflect at the ends; never teleport from one end of a street to the other.
export function sampleWalk(path,distanceTravelled,out={}){
 const period=path.length*(path.loop?1:2);
 let d=((distanceTravelled%period)+period)%period;
 const reverse=!path.loop&&d>path.length;if(reverse)d=path.length*2-d;
 let lo=1,hi=path.lengths.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(path.lengths[mid]<d)lo=mid+1;else hi=mid;}
 const a=path.points[lo-1],b=path.points[lo],t=(d-path.lengths[lo-1])/(path.lengths[lo]-path.lengths[lo-1]);
 out.x=a[0]+(b[0]-a[0])*t;out.z=a[1]+(b[1]-a[1])*t;
 out.angle=Math.atan2(b[0]-a[0],b[1]-a[1])+(reverse?Math.PI:0);
 out.y=streetHeight(out.x,out.z,BRIDGES,heightAt(out.x,out.z));
 return out;
}

// Integrate walk/pause cycles instead of resetting distance when an activity changes.
export function personMotion(person,time){
 const duration=person.activeFor+person.restFor;
 const elapsed=t=>Math.floor(t/duration)*person.activeFor+Math.min(t%duration,person.activeFor);
 const t=time+person.offset,moving=t%duration<person.activeFor;
 return {distance:person.start+(elapsed(t)-elapsed(person.offset))*person.speed,moving};
}
