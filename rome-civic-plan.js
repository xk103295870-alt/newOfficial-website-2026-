// Hand-composed civic precinct: a few continuous streets, not nearest-neighbour
// shortcuts between procedural lane ends. This remains an illustrative plan.
export const CIVIC_BOUNDARY=[[-146,-159],[58,-159],[139,-65],[139,105],[42,140],[-98,69],[-146,4]];
export function inCivicPrecinct([x,z]){let yes=false;for(let i=0,j=CIVIC_BOUNDARY.length-1;i<CIVIC_BOUNDARY.length;j=i++){
 const a=CIVIC_BOUNDARY[i],b=CIVIC_BOUNDARY[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])yes=!yes;
}return yes;}
const street=(id,zh,en,width,points)=>({id,zh,en,width,points,civic:true});
export const CIVIC_STREETS=[
 street('sacra','神圣大道','Sacred Way',4.2,[[-132,-33],[-116,-46],[-94,-50],[-46,-36],[-12,-11],[19,11],[48,20],[93,29],[142,8]]),
 street('forum-north','广场北街','Forum north street',3.4,[[-69,-99],[-29,-80],[-5,-66],[48,-23],[48,-36],[86,-37],[139,-65]]),
 street('flaminia','战神广场主街','Campus Martius street',4,[[-65,-164],[-69,-99],[-89,-88],[-94,-50]]),
 street('trajan-east','图拉真东街','Trajan east street',3.4,[[68,-146],[47,-144],[32,-120],[-5,-66]]),
 street('river-east','剧场沿河街','Theatre riverside street',3.6,[[-154,-125],[-140,-110],[-132,-82],[-132,-33],[-114,6],[-89,33],[-75,43],[-106,72]]),
 street('palatine-west','帕拉蒂尼山下街','Palatine lower street',3.6,[[-12,-11],[3,1],[-30,49],[37,95],[68,96]]),
 street('appia','阿庇亚接续街','Appian connection',4.2,[[48,20],[72,40],[68,96],[108,127],[141,157]]),
 street('circus-north','竞技场北街','Circus north street',3.4,[[-75,43],[-65,33],[-30,49]]),
];
export const CIVIC_BLOCKS=[
 {id:'river-housing',x:-113,z:-85,w:36,d:46,angle:.13},
 {id:'velabrum-housing',x:-65,z:9,w:46,d:38,angle:-.6},
 {id:'subura-frontage',x:62,z:-62,w:56,d:48,angle:-.63},
 {id:'north-frontage',x:-29,z:-151,w:36,d:22,angle:.1},
 {id:'north-workshops',x:9,z:-151,w:25,d:16,angle:.1},
 {id:'east-workshops',x:107,z:-69,w:22,d:25,angle:-.60},
 {id:'east-frontage',x:116,z:2,w:37,d:48,angle:.30},
];
export function outsideCivicSegments(road){
 const sections=[];let run=[];
 const flush=()=>{
  if(run.length>1){let length=0;for(let i=1;i<run.length;i++)length+=Math.hypot(run[i][0]-run[i-1][0],run[i][1]-run[i-1][1]);
   if(length>9){const points=run.filter((p,i,a)=>!i||i===a.length-1||Math.abs((p[0]-a[i-1][0])*(a[i+1][1]-p[1])-(p[1]-a[i-1][1])*(a[i+1][0]-p[0]))>1e-6);sections.push({...road,points});}}
  run=[];
 };
 for(let i=1;i<road.points.length;i++){
  const a=road.points[i-1],b=road.points[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*2);
  for(let j=i===1?0:1;j<=n;j++){const p=[a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n];if(inCivicPrecinct(p))flush();else run.push(p);}
 }flush();return sections;
}

export const CIVIC_PLAZAS=[
 {id:'market',name:'东侧市集',x:64,z:-109,w:44,d:28,angle:-.6,kind:'market'},
 {id:'olive-court',name:'橄榄树庭院',x:-85,z:-112,w:24,d:19,angle:.1,kind:'garden'},
 {id:'fountain-court',name:'居民休憩广场',x:-28,z:9,w:22,d:24,angle:-.6,kind:'fountain'},
 {id:'north-court',name:'北侧小广场',x:-48,z:-124,w:23,d:25,angle:.1,kind:'garden'},
 {id:'theatre-court',name:'剧场前小广场',x:-55,z:-20,w:24,d:20,angle:-.6,kind:'social'},
];

export const CIVIC_ACCESS=CIVIC_PLAZAS.map(p=>{
 let nearest=null,best=Infinity;
 for(const r of CIVIC_STREETS)for(let i=1;i<r.points.length;i++){
  const a=r.points[i-1],b=r.points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p.x-a[0])*dx+(p.z-a[1])*dz)/(dx*dx+dz*dz)));
  const q=[a[0]+dx*t,a[1]+dz*t],d=Math.hypot(q[0]-p.x,q[1]-p.z);if(d<best){best=d;nearest=q;}
 }
 const dx=nearest[0]-p.x,dz=nearest[1]-p.z,c=Math.cos(p.angle),s=Math.sin(p.angle),u=dx*c-dz*s,v=dx*s+dz*c;
 const t=Math.min((p.w/2-.3)/Math.abs(u||1e-9),(p.d/2-.3)/Math.abs(v||1e-9));
 return {id:p.id+'-access',zh:p.name+'步道',en:'Plaza walk',width:1.6,points:[[p.x+dx*t,p.z+dz*t],nearest],civic:true,pedestrianOnly:true};
});

// Reserved planted ground in the remaining civic gaps. Streets cut through
// these garden envelopes rather than being covered by a giant green slab.
export const CIVIC_LAWNS=[
 {id:'east-garden',x:104,z:-94,w:25,d:20,angle:-.6},
 {id:'central-garden',x:22,z:-74,w:19,d:13,angle:-.6},
 {id:'south-garden',x:-49,z:30,w:18,d:10,angle:-.6},
 {id:'river-garden',x:-116,z:6,w:16,d:18,angle:-.6},
 ...CIVIC_PLAZAS.filter(p=>p.kind==='garden').map(p=>({...p,id:p.id+'-lawn',w:p.w-10,d:p.d-10})),
];
