// Continuous ribbons share their cross-sections at bends; independent segment
// rectangles leave triangular gaps and overlapping edges at every turn.
export function samplePolyline(points,step=2){
 const out=[points[0]];
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
  if(len<1e-7)continue;
  const n=Math.ceil(len/step);for(let j=1;j<=n;j++)out.push([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n]);
 }
 return out;
}
export function roundRiver(points,trim=3){
 const out=[points[0]];
 for(let i=1;i<points.length-1;i++){
  const a=points[i-1],p=points[i],b=points[i+1],la=Math.hypot(p[0]-a[0],p[1]-a[1]),lb=Math.hypot(b[0]-p[0],b[1]-p[1]);
  const t=Math.min(trim,la*.15,lb*.15),u=[p[0]+(a[0]-p[0])*t/la,p[1]+(a[1]-p[1])*t/la],v=[p[0]+(b[0]-p[0])*t/lb,p[1]+(b[1]-p[1])*t/lb];
  out.push(u);for(let j=1;j<=8;j++){const s=j/8;out.push([(1-s)**2*u[0]+2*s*(1-s)*p[0]+s*s*v[0],(1-s)**2*u[1]+2*s*(1-s)*p[1]+s*s*v[1]]);}
 }
 out.push(points.at(-1));return samplePolyline(out,2);
}
export function ribbonSections(points){
 const direction=(a,b)=>{const l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return [(b[0]-a[0])/l,(b[1]-a[1])/l];};
 return points.map((p,i)=>{
  const a=direction(points[Math.max(0,i-1)],i? p:points[1]),b=direction(p,points[Math.min(i+1,points.length-1)]);
  if(i===points.length-1)b.splice(0,2,...a);
  const na=[-a[1],a[0]],nb=[-b[1],b[0]],l=Math.hypot(na[0]+nb[0],na[1]+nb[1]);
  const n=l<1e-6?nb:[(na[0]+nb[0])/l,(na[1]+nb[1])/l],scale=1/Math.max(.6,n[0]*nb[0]+n[1]*nb[1]);
  return {p,n:[n[0]*scale,n[1]*scale]};
 });
}
export const offsetPoint=(s,d)=>[s.p[0]+s.n[0]*d,s.p[1]+s.n[1]*d];
export function riverTerrainHeight(distance,normal){
 if(distance>=11)return normal;
 if(distance<=8)return -.95;
 const t=(distance-8)/3,s=t*t*(3-2*t);
 return -.95+(normal+.95)*s;
}
export function stripPositions(sections,left,right,elevation){
 const positions=[];
 for(let i=1;i<sections.length;i++){
  const corners=[offsetPoint(sections[i-1],left),offsetPoint(sections[i-1],right),offsetPoint(sections[i],right),offsetPoint(sections[i],left)];
  for(const j of [0,1,2,0,2,3]){const p=corners[j];positions.push(p[0],elevation(p,j===0||j===3?left:right),p[1]);}
 }
 return positions;
}
