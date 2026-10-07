import {CIVIC_PLAZAS,CIVIC_ACCESS} from './rome-civic-plan.js';
export function plazaPoint(p,u,v){const c=Math.cos(p.angle),s=Math.sin(p.angle);return [p.x+u*c+v*s,p.z-u*s+v*c];}
function nearAccess(q){return CIVIC_ACCESS.some(r=>{const [a,b]=r.points,dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((q[0]-a[0])*dx+(q[1]-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(q[0]-a[0]-t*dx,q[1]-a[1]-t*dz)<2.5;});}
// Shared furniture footprints keep pedestrians, planting and the renderer in sync.
export const PUBLIC_FIXTURES=[],PUBLIC_TREES=[],PLAZA_LOOPS=[];
for(const p of CIVIC_PLAZAS){
 const fixture=(kind,u,v,w,d)=>{const [x,z]=plazaPoint(p,u,v);if(!nearAccess([x,z]))PUBLIC_FIXTURES.push({plaza:p.id,kind,x,z,w,d,angle:p.angle});};
 if(p.kind==='fountain'||p.kind==='market')fixture('fountain',0,0,3,3);
 if(p.kind==='market')for(const u of [-p.w/2+5,0,p.w/2-5])for(const side of [-1,1])fixture('stall',u,side*(p.d/2-1.4),3.5,2.3);
 else for(const side of [-1,1])fixture('bench',side*(p.w/2-1),0,.8,2.6);
 const tree=(u,v)=>{const [x,z]=plazaPoint(p,u,v);if(!nearAccess([x,z]))PUBLIC_TREES.push({x,z,plaza:p.id});};
 for(const side of [-1,1]){
  for(let u=-p.w/2+1.3;u<=p.w/2-1.3;u+=4.6)tree(u,side*(p.d/2-1.3));
  for(let v=-p.d/2+5.9;v<p.d/2-3;v+=4.6)tree(side*(p.w/2-1.3),v);
 }
 const u=p.w/2-3.2,v=p.d/2-3.2;
 PLAZA_LOOPS.push({plaza:p.id,points:[[-u,-v],[u,-v],[u,v],[-u,v],[-u,-v]].map(q=>plazaPoint(p,...q))});
}
