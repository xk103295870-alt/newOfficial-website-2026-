import {inCivicPrecinct,CIVIC_STREETS,CIVIC_BLOCKS,CIVIC_PLAZAS,CIVIC_LAWNS,CIVIC_ACCESS,outsideCivicSegments} from './rome-civic-plan.js';
import { BRIDGE_APPROACH } from './rome-engineering-plan.js';
// Schematic plan of imperial Rome. North is -Z, east is +X.
// Monument relationships follow the supplied reconstruction reference; residential
// footprints are generated, not surveyed archaeological building data.
// An asymmetric, indented perimeter: north gate, eastern salients, southern
// Appian wedge and a compact west-bank quarter. Never generate a circular ring.
export const CITY_BOUNDARY = [[-80,-510],[-8,-440],[88,-342],[112,-372],[114,-440],[181,-440],[193,-277],[252,-226],[258,-160],[295,-124],[289,-54],[325,22],[286,79],[233,88],[222,143],[176,184],[128,242],[30,261],[-35,208],[-93,177],[-124,200],[-163,152],[-189,155],[-214,118],[-249,102],[-261,30],[-245,-13],[-224,-48],[-227,-113],[-205,-175],[-207,-219],[-159,-263],[-150,-298],[-119,-308]];
export const CITY_EXTENT={minX:Math.min(...CITY_BOUNDARY.map(p=>p[0])),maxX:Math.max(...CITY_BOUNDARY.map(p=>p[0])),minZ:Math.min(...CITY_BOUNDARY.map(p=>p[1])),maxZ:Math.max(...CITY_BOUNDARY.map(p=>p[1]))};

export const RIVER = [[-168,-308],[-180,-244],[-187,-204],[-179,-174],[-174,-125],[-164,-86],[-166,-40],[-146,-8],[-123,14],[-113,54],[-130,93],[-169,139],[-205,188],[-238,266]];
export const RIVER_WIDTH = 16;
export const AQUEDUCT = [[153,135],[258,269.4]];
export const AQUEDUCT_NODES=[{x:153,z:135,w:14,d:12,angle:0},{x:258,z:269.4,w:10,d:8,angle:0}];
export const LANDMARKS = [
 {id:'forum',zh:'古罗马广场',en:'Roman Forum',x:1,z:-29,w:65,d:29,angle:-.63,type:'forum'},
 {id:'colosseum',zh:'斗兽场',en:'Colosseum',x:70,z:-3,w:44,d:35,angle:-.35,type:'arena'},
 {id:'circus',zh:'大竞技场',en:'Circus Maximus',x:-29,z:94,w:120,d:28,angle:-.62,type:'circus'},
 {id:'pantheon',zh:'万神殿',en:'Pantheon',x:-94,z:-141,w:31,d:37,angle:.08,type:'pantheon'},
 {id:'trevi',zh:'特雷维许愿池（18世纪）',en:'Trevi Fountain (18th century)',x:-35,z:-179,w:32,d:27,angle:.08,type:'fountain',era:'18th-century addition'},
 {id:'palatine',zh:'帕拉蒂尼山宫殿',en:'Palatine Palaces',x:21,z:49,w:69,d:45,angle:-.6,type:'palace'},
 {id:'trajan',zh:'图拉真广场',en:'Forum of Trajan',x:-7,z:-106,w:34,d:54,angle:-.6,type:'forum'},
 {id:'capitoline',zh:'卡比托利欧山',en:'Capitoline Hill',x:-59,z:-64,w:35,d:30,angle:-.5,type:'temple'},
 {id:'caracalla',zh:'卡拉卡拉浴场',en:'Baths of Caracalla',x:65,z:158,w:75,d:60,angle:-.32,type:'baths'},
 {id:'diocletian',zh:'戴克里先浴场',en:'Baths of Diocletian',x:120,z:-198,w:62,d:51,angle:.45,type:'baths'},
 {id:'marcellus',zh:'马尔凯鲁斯剧场',en:'Theatre of Marcellus',x:-91,z:-23,w:33,d:28,angle:.1,type:'theatre'},
 {id:'stadium',zh:'图密善体育场',en:'Stadium of Domitian',x:-135,z:-154,w:21.2,d:55,angle:.12,type:'stadium'},
 {id:'claudius',zh:'克劳狄神庙',en:'Temple of Claudius',x:100,z:63,w:42,d:35,angle:-.3,type:'temple'}
];
export function inside(p, polygon=CITY_BOUNDARY) {
 let yes=false; for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
 const a=polygon[i],b=polygon[j]; if((a[1]>p[1])!==(b[1]>p[1]) && p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]) yes=!yes;
 } return yes;
}
export function segmentDistance(p,a,b){ const dx=b[0]-a[0],dz=b[1]-a[1]; const t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz||1))); return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz); }
export function pathDistance(p,points){let d=Infinity;for(let i=1;i<points.length;i++)d=Math.min(d,segmentDistance(p,points[i-1],points[i]));return d;}
export function landmarkContains(p,m,margin=0){const dx=p[0]-m.x,dz=p[1]-m.z,c=Math.cos(m.angle),s=Math.sin(m.angle);return Math.abs(dx*c-dz*s)<m.w/2+margin && Math.abs(dx*s+dz*c)<m.d/2+margin;}
// SAT and segment/box tests allow tight street-front blocks without replacing
// rectangles with oversized circular collision discs.
export function footprintsOverlap(a,b,gap=.4){
 for(const t of [a.angle,b.angle])for(const axis of [[Math.cos(t),-Math.sin(t)],[Math.sin(t),Math.cos(t)]]){
  const radius=m=>Math.abs(axis[0]*Math.cos(m.angle)-axis[1]*Math.sin(m.angle))*m.w/2+Math.abs(axis[0]*Math.sin(m.angle)+axis[1]*Math.cos(m.angle))*m.d/2;
  if(Math.abs((a.x-b.x)*axis[0]+(a.z-b.z)*axis[1])>=radius(a)+radius(b)+gap)return false;
 }return true;
}
export function footprintMeetsPath(m,points,clearance=0){
 const c=Math.cos(m.angle),s=Math.sin(m.angle),hw=m.w/2+clearance,hd=m.d/2+clearance;
 const local=p=>[(p[0]-m.x)*c-(p[1]-m.z)*s,(p[0]-m.x)*s+(p[1]-m.z)*c];
 for(let i=1;i<points.length;i++){
  const a=local(points[i-1]),b=local(points[i]);let lo=0,hi=1;
  for(let k=0;k<2;k++){
   const d=b[k]-a[k],half=k?hd:hw;
   if(Math.abs(d)<1e-9){if(Math.abs(a[k])>half){hi=-1;break;}}
   else {const t1=(-half-a[k])/d,t2=(half-a[k])/d;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2));}
  }
  if(lo<=hi)return true;
 }return false;
}
export function naturalHeightAt(x,z){
 const hill=(cx,cz,r,h)=>h*Math.max(0,1-((x-cx)**2+(z-cz)**2)/(r*r))**2;
 const plateau=(cx,cz,rx,rz,h,angle=0)=>{const dx=x-cx,dz=z-cz,c=Math.cos(angle),s=Math.sin(angle),d=Math.max(Math.abs((dx*c-dz*s)/rx),Math.abs((dx*s+dz*c)/rz)),t=Math.max(0,Math.min(1,(d-.76)/.24));return h*(1-t*t*(3-2*t));};
 return plateau(21,49,49,34,7,-.6)+plateau(-59,-64,26,23,4,-.5)+hill(107,-85,90,2.4)+hill(100,80,65,2);
}
// The landscape grid has 4-unit cells. A 6-unit level apron protects not only
// the footprint vertices, but also triangles interpolating across their edges.
export const MONUMENT_TERRAIN_APRON=6;
const MONUMENT_TERRACES=LANDMARKS.map(m=>({...m,y:naturalHeightAt(m.x,m.z),c:Math.cos(m.angle),s:Math.sin(m.angle)}));
export function heightAt(x,z){
 const natural=naturalHeightAt(x,z);let y=natural;
 for(const m of MONUMENT_TERRACES){
  if(natural<=m.y)continue;
  const dx=x-m.x,dz=z-m.z,u=dx*m.c-dz*m.s,v=dx*m.s+dz*m.c;
  const distance=Math.hypot(Math.max(0,Math.abs(u)-m.w/2),Math.max(0,Math.abs(v)-m.d/2));
  if(distance>=MONUMENT_TERRAIN_APRON+6)continue;
  const t=Math.max(0,(distance-MONUMENT_TERRAIN_APRON)/6),blend=t*t*(3-2*t);
  // Lower the encroaching hill into a level precinct; never raise a low valley
  // to match a neighbouring hilltop. Overlapping aprons use the lower datum.
  y=Math.min(y,m.y+(natural-m.y)*blend);
 }
 return y;
}

const ROAD_GUIDES = [
 {zh:'神圣大道',en:'Via Sacra',width:5,points:[[-73,-62],[-53,-54],[-23,-46],[6,-11],[43,8],[69,23],[105,25],[146,0],[201,-18]]},
 {zh:'苏布拉街道',en:'Subura',width:5,points:[[-32,-62],[21,-69],[40,-100],[68,-146],[120,-161],[170,-183]]},
 {zh:'阿庇亚大道',en:'Via Appia',width:6,points:[[45,20],[58,51],[71,90],[108,127],[119,166],[140,233]]},
 {zh:'弗拉米尼亚大道',en:'Via Flaminia',width:5,points:[[-56,-71],[-60,-111],[-62,-169],[-71,-220],[-80,-499]]},
 {zh:'竞技场外街',en:'Circus Road',width:5,points:[[-91,49],[-67,72],[-30,101],[19,124],[41,133],[92,115]]},
 {zh:'河岸街道',en:'Tiber Quays',width:4,points:[[-150,-239],[-149,-208],[-106,-174],[-111,-126],[-143,-81],[-143,-44],[-124,-18],[-102,5],[-92,54],[-109,96],[-149,150]]},
 {zh:'跨河街道',en:'Transtiberim',width:4,points:[[-245,28],[-234,-12],[-215,-31],[-190,-22],[-170,-6],[-143,17],[-101,38],[-82,30],[-73,11],[-63,-4]]},
 {zh:'埃斯奎利诺街道',en:'Esquiline',width:4,points:[[86,-29],[108,-50],[145,-78],[188,-114],[250,-135],[278,-128]]}
];
// Overlapping street-oriented patches are CLIPPED by the real perimeter and
// river, not elliptical neighbourhood islands. Each has its own street grain.
export const DISTRICTS = [
 {zh:'战神广场区',en:'Campus Martius',x:-110,z:-260,rx:71,rz:138,angle:.10},
 {zh:'弗拉米尼亚街区',en:'Flaminian quarter',x:-57,z:-390,rx:53,rz:105,angle:.10},
 {zh:'苏布拉',en:'Subura',x:39,z:-83,rx:72,rz:60,angle:-.52},
 {zh:'埃斯奎利诺',en:'Esquiline',x:156,z:-95,rx:83,rz:72,angle:.30},
 {zh:'奎里纳莱',en:'Quirinal',x:34,z:-249,rx:67,rz:112,angle:-.20},
 {zh:'东北街区',en:'Northeastern quarter',x:149,z:-354,rx:51,rz:80,angle:.03},
 {zh:'维米纳莱',en:'Viminal',x:199,z:-227,rx:43,rz:70,angle:.40},
 {zh:'东部住宅区',en:'Eastern housing',x:254,z:-59,rx:50,rz:76,angle:.30},
 {zh:'凯利乌斯',en:'Caelian',x:174,z:49,rx:68,rz:53,angle:-.32},
 {zh:'南部街区',en:'Southern quarter',x:154,z:142,rx:49,rz:62,angle:-.43},
 {zh:'阿庇亚街区',en:'Appian quarter',x:89,z:217,rx:55,rz:40,angle:-.43},
 {zh:'阿文丁',en:'Aventine',x:-38,z:145,rx:61,rz:59,angle:-.57},
 {zh:'台伯河西岸',en:'Transtiberim',x:-213,z:27,rx:37,rz:112,angle:.20},
 {zh:'西岸南街区',en:'West-bank south',x:-177,z:125,rx:34,rz:38,angle:-.40},
 {zh:'中央住宅区',en:'Velabrum',x:-70,z:3,rx:47,rz:64,angle:-.48},
 {zh:'滨河街区',en:'River quarter',x:-140,z:-82,rx:27,rz:84,angle:.13},
 {zh:'河港区',en:'Emporium',x:-124,z:157,rx:36,rz:38,angle:-.58},
 {zh:'帝国广场北街区',en:'Imperial precinct north',x:-28,z:-142,rx:52,rz:34,angle:-.60}
];
function districtOwner(x,z){
 let owner=null,best=Infinity;
 for(const d of DISTRICTS){const dx=x-d.x,dz=z-d.z,c=Math.cos(d.angle),s=Math.sin(d.angle),u=(dx*c-dz*s)/d.rx,v=(dx*s+dz*c)/d.rz;
  if(Math.abs(u)>1||Math.abs(v)>1)continue;const score=u*u+v*v;if(score<best){best=score;owner=d;}}
 return owner;
}
// Crossings and streets share the same geometry used by the renderer and carts.
export const BRIDGES = [
 {x:-119,z:29,angle:-.46,w:32,d:8},
 {x:-166,z:-50,angle:0,w:32,d:8},
 {x:-173,z:-133,angle:0,w:32,d:8}
];
function routeStreet(guide){
 const step=2,origin=Math.min(CITY_EXTENT.minX,CITY_EXTENT.minZ)-6,size=Math.ceil((Math.max(CITY_EXTENT.maxX,CITY_EXTENT.maxZ)-origin+6)/step)+1,margin=guide.width/2+1.5;
 const point=id=>[origin+(id%size)*step,origin+Math.floor(id/size)*step];
 const walkable=new Uint8Array(size*size);
 for(let id=0;id<walkable.length;id++){
  const p=point(id);
  walkable[id]=inside(p) && !LANDMARKS.some(m=>landmarkContains(p,m,margin)) &&
   (pathDistance(p,RIVER)>RIVER_WIDTH/2+margin || BRIDGES.some(b=>landmarkContains(p,b,-.15)))?1:0;
 }
 function nearest(p){let best=-1,dist=Infinity;for(let id=0;id<walkable.length;id++)if(walkable[id]){const q=point(id),d=(q[0]-p[0])**2+(q[1]-p[1])**2;if(d<dist){dist=d;best=id;}}return best;}
 function search(start,end){
  const cost=new Float64Array(walkable.length).fill(Infinity),parent=new Int32Array(walkable.length).fill(-1),heap=[];
  const goal=point(end),estimate=id=>{const p=point(id);return Math.hypot(p[0]-goal[0],p[1]-goal[1]);};
  function push(id,score){let i=heap.length;heap.push({id,score});while(i>0){const p=(i-1)>>1;if(heap[p].score<=score)break;[heap[i],heap[p]]=[heap[p],heap[i]];i=p;}}
  function pop(){const first=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;while(true){let c=i*2+1;if(c>=heap.length)break;if(c+1<heap.length&&heap[c+1].score<heap[c].score)c++;if(heap[i].score<=heap[c].score)break;[heap[i],heap[c]]=[heap[c],heap[i]];i=c;}}return first;}
  cost[start]=0;push(start,estimate(start));
  while(heap.length){const {id,score}=pop();if(score>cost[id]+estimate(id)+.001)continue;if(id===end){const out=[];for(let n=end;n!==-1;n=parent[n])out.push(point(n));return out.reverse();}
   for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){
    const x=id%size+dx,z=Math.floor(id/size)+dz;if(x<0||x>=size||z<0||z>=size)continue;const next=z*size+x;if(!walkable[next])continue;
    if(dx&&dz&&(!walkable[id+dx]||!walkable[id+dz*size]))continue;
    const g=cost[id]+step*Math.hypot(dx,dz);if(g>=cost[next])continue;cost[next]=g;parent[next]=id;push(next,g+estimate(next));
   }
  }
  throw new Error(`No open street route: ${guide.en} ${point(start)} to ${point(end)}`);
 }
 let points=[];for(let i=1;i<guide.points.length;i++){const section=search(nearest(guide.points[i-1]),nearest(guide.points[i]));points.push(...(i===1?section:section.slice(1)));}
 const visible=(a,b)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1]));for(let j=0;j<=n;j++){const t=n?j/n:0,p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];if(!inside(p)||LANDMARKS.some(m=>landmarkContains(p,m,margin))||(pathDistance(p,RIVER)<=RIVER_WIDTH/2+margin&&!BRIDGES.some(m=>landmarkContains(p,m,-.15))))return false;}return true;};
 const smoothed=[];for(let i=0;i<points.length;){smoothed.push(points[i]);if(i===points.length-1)break;let next=i+1;for(let j=i+2;j<Math.min(points.length,i+22);j++)if(visible(points[i],points[j]))next=j;i=next;}points=smoothed;
 // Keep only direction changes, then resample each segment for terrain conformity.
 points=points.filter((p,i,a)=>!i||i===a.length-1||(p[0]-a[i-1][0])*(a[i+1][1]-p[1])!==(p[1]-a[i-1][1])*(a[i+1][0]-p[0]));
 return {...guide,points};
}
export const ROADS=[...ROAD_GUIDES.map(routeStreet).flatMap(r=>outsideCivicSegments({...r,arterial:true})),...CIVIC_STREETS];

export const RURAL_VILLAGES=[{id:'north',x:-72,z:-569,angle:.04},{id:'south',x:153,z:316,angle:-.24},{id:'west',x:-310,z:3,angle:1.35},{id:'east',x:369,z:-72,angle:.2}];
function gateNetwork(){
 const roads=[],gates=[];
 for(const [name,id,start] of [['Via Flaminia','north',false],['Via Appia','south',false],['Transtiberim','west',true]]){
  const urban=ROADS.find(r=>r.en===name),p=start?urban.points[0]:urban.points.at(-1),v=RURAL_VILLAGES.find(v=>v.id===id);
  const candidates=CITY_BOUNDARY.map((a,i)=>{const b=CITY_BOUNDARY[(i+1)%CITY_BOUNDARY.length],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz)));return [a[0]+dx*t,a[1]+dz*t];});
  candidates.sort((a,b)=>Math.hypot(a[0]-p[0],a[1]-p[1])-Math.hypot(b[0]-p[0],b[1]-p[1]));
  gates.push({x:candidates[0][0],z:candidates[0][1]});
  roads.push({id,width:3.2,points:[p,candidates[0],[(candidates[0][0]+v.x)/2+4,(candidates[0][1]+v.z)/2],[v.x,v.z]]});
 }
 roads.push({id:'east',width:3,points:[[153,316],[255,289],[347,175],[373,45],[369,-72]]});
 return {roads,gates};
}
export const GATE_NETWORK=gateNetwork();

export function createCityPlan(seed=310){
 let state=seed;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 const buildings=[],streets=[...ROADS,...CIVIC_ACCESS];
 const approaches=BRIDGES.map(b=>({...b,w:b.w+2*BRIDGE_APPROACH}));
 const safe=(x,z,r)=>inside([x,z]) && !approaches.some(b=>landmarkContains([x,z],b,r+.5)) && pathDistance([x,z],RIVER)>RIVER_WIDTH/2+r+3 && pathDistance([x,z],AQUEDUCT)>r+2 && pathDistance([x,z],[...CITY_BOUNDARY,CITY_BOUNDARY[0]])>r+4 && !LANDMARKS.some(m=>landmarkContains([x,z],m,r+1.8)) && !GATE_NETWORK.roads.some(road=>pathDistance([x,z],road.points)<r+road.width/2+.5);
 // Local lanes have different orientations in each quarter; no city-wide grid.
 for(const district of DISTRICTS){
  const c=Math.cos(district.angle),s=Math.sin(district.angle);
  const world=(u,v)=>[district.x+u*c+v*s,district.z-u*s+v*c];
  for(const across of [false,true]){
   const range=across?district.rz:district.rx,length=across?district.rx:district.rz,spacing=across?37:28;
   for(let u=-range+4;u<range;u+=spacing){
    let run=[];const flush=()=>{if(run.length>1)streets.push({zh:district.zh,en:district.en,width:across?2:2.6,points:run});run=[];};
    for(let v=-length;v<=length;v+=4){const bend=Math.sin(v*.025)*.65,p=across?world(v,u+bend):world(u+bend,v);if(!inCivicPrecinct(p)&&districtOwner(...p)===district&&safe(...p,1.5))run.push(p);else flush();}flush();
   }
  }
 }
 // Stitch nearby lane ends before placing houses, so streets do not stop in empty gaps.
 const project=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz||1)));return [a[0]+t*dx,a[1]+t*dz];};
 const clearLink=(a,b,width,allowCivic=false)=>{
  const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*4);
  for(let j=0;j<=n;j++){
   const p=[a[0]+(b[0]-a[0])*j/(n||1),a[1]+(b[1]-a[1])*j/(n||1)];
   if((!allowCivic&&inCivicPrecinct(p))||!inside(p)||LANDMARKS.some(m=>landmarkContains(p,m,width/2+1.5))||pathDistance(p,AQUEDUCT)<width/2+1.2)return false;
   if(pathDistance(p,RIVER)<RIVER_WIDTH/2+width/2+1.25&&!approaches.some(b=>landmarkContains(p,b,-width/2)))return false;
  }return true;
 };
 // Bridge axes and their ramps must be part of the visible road network.
 for(const b of BRIDGES){
  const point=u=>[b.x+u*Math.cos(b.angle),b.z-u*Math.sin(b.angle)];
  streets.push({zh:'桥头道路',en:'Bridge approach',width:4,bridge:true,points:[point(-b.w/2-BRIDGE_APPROACH),point(b.w/2+BRIDGE_APPROACH)]});
 }
 const baseStreets=[...streets];
 for(const street of baseStreets.filter(s=>!s.civic))for(const end of [0,street.points.length-1]){
  const p=street.points[end],candidates=[];
  for(const other of baseStreets){if(other===street)continue;
   for(let i=1;i<other.points.length;i++){
    const q=project(p,other.points[i-1],other.points[i]),d=Math.hypot(p[0]-q[0],p[1]-q[1]);
    if(d<(street.bridge?72:street.arterial&&other.civic?40:12))candidates.push({q,d,civic:other.civic});
   }
  }
  candidates.sort((a,b)=>a.d-b.d);
  if(candidates[0]?.d<.5)continue;
  for(const c of candidates){if(c.d<.5)break;if(!clearLink(p,c.q,street.width,street.bridge||(street.arterial&&c.civic)))continue;
   streets.push({zh:'街巷连接',en:'Lane connection',width:street.width,connector:true,civicEntry:!!(street.bridge||(street.arterial&&c.civic)),points:[p,c.q]});break;
  }
 }
 // Dense street-facing parcels, not circular clusters separated by parkland.
 const buckets=new Map(),cell=24;
 function neighbours(x,z){const result=[];for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)result.push(...(buckets.get(`${Math.floor(x/cell)+i}:${Math.floor(z/cell)+j}`)||[]));return result;}
 function accept(b,district,civic=false){
  const {x,z,r}=b;
  if(!civic){
   if(districtOwner(x,z)!==district)return false;
   const corners=[[-b.w/2,-b.d/2],[b.w/2,-b.d/2],[b.w/2,b.d/2],[-b.w/2,b.d/2]];
   if(inCivicPrecinct([x,z])||corners.some(([u,v])=>inCivicPrecinct([x+u*Math.cos(b.angle)+v*Math.sin(b.angle),z-u*Math.sin(b.angle)+v*Math.cos(b.angle)])))return false;
  }
  if(!safe(x,z,r)||[...CIVIC_PLAZAS,...CIVIC_LAWNS].some(p=>footprintsOverlap(b,p,1))||AQUEDUCT_NODES.some(p=>footprintsOverlap(b,p,2)))return false;
  if(streets.some(road=>footprintMeetsPath(b,road.points,road.width/2+.5)))return false;
  if(neighbours(x,z).some(other=>footprintsOverlap(b,other,.55)))return false;
  buildings.push(b);const key=`${Math.floor(x/cell)}:${Math.floor(z/cell)}`;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(b);return true;
 }
 // Deliberately bounded housing groups; no random single houses in civic forecourts.
 for(const block of CIVIC_BLOCKS){
  const nx=Math.floor(block.w/6.8),nz=Math.floor(block.d/8),sw=block.w/nx,sd=block.d/nz,c=Math.cos(block.angle),s=Math.sin(block.angle);
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){
   const u=-block.w/2+sw*(i+.5),v=-block.d/2+sd*(j+.5),w=sw-1.1,d=sd-1.4;
   accept({x:block.x+u*c+v*s,z:block.z-u*s+v*c,w,d,r:Math.hypot(w,d)/2,h:3.4+(i%2)*.8,angle:block.angle,style:0,district:'核心街区',en:'Civic quarter',block:block.id},null,true);
  }
 }
 for(const district of DISTRICTS){
  const c=Math.cos(district.angle),s=Math.sin(district.angle);
  function parcel(u,v,w,d,style=0){
   const x=district.x+u*c+v*s,z=district.z-u*s+v*c,r=Math.hypot(w,d)/2;
   return {x,z,w,d,r,h:2.5+random()*5.2,angle:district.angle,style,district:district.zh,en:district.en};
  }
  // First subdivide street blocks into close-set frontages. This keeps a readable
  // urban fabric instead of filling the map with disconnected random houses.
  for(let u=-district.rx+4;u+28<district.rx;u+=28)for(let v=-district.rz+4;v+37<district.rz;v+=37){
   const occupied=new Set();
   for(let row=0;row<4;row++)for(let col=0;col<3;col++){
    if(occupied.has(`${row}:${col}`))continue;
    if(row%2===0&&col===0&&random()<.35&&accept(parcel(u+10.325,v+10.5+row*8,14.2,15.3,4),district)){
     for(const [rr,cc] of [[row,col+1],[row+1,col],[row+1,col+1]])occupied.add(`${rr}:${cc}`);continue;
    }
    const w=6.55+random()*.35,d=7.05+random()*.35;
    accept(parcel(u+6.6+col*7.45,v+6.5+row*8,w,d,Math.floor(random()*4)),district);
   }
  }
  // Irregular edge parcels close the gaps along diagonal avenues and hill roads.
  for(let k=0;k<15000;k++){
   const u=(random()*2-1)*district.rx,v=(random()*2-1)*district.rz;
   const courtyard=random()<.20,w=courtyard?8+random()*4:3.7+random()*3.7,d=courtyard?9+random()*4:5+random()*4.6;
   accept(parcel(u,v,w,d,courtyard?4:Math.floor(random()*4)),district);
  }
 }
 return {buildings,streets,plazas:CIVIC_PLAZAS,lawns:CIVIC_LAWNS,seed};
}
