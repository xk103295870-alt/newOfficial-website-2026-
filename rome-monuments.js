import * as THREE from './assets/vendor/three.module.min.js';
import {archWallGeometry} from './rome-structure-geometry.js';
import {architectureKit} from './rome-architecture.js';
export const PANTHEON={radius:11,drumHeight:11,oculusRadius:11*8.92/43.3,frontColumns:8,totalColumns:16,cofferRings:5,coffersPerRing:28};
export function pantheonDomeGeometry(){
 const {radius:r,oculusRadius:o}=PANTHEON,outer=12.3,height=11.6,profile=[];
 for(let i=0;i<7;i++){
  const y=i*.45,rad=outer*Math.sqrt(1-(y/height)**2);
  profile.push(new THREE.Vector2(rad,y),new THREE.Vector2(rad,y+.42));
 }
 const start=Math.asin(o/outer),end=Math.acos(3.12/height);
 for(let i=0;i<=32;i++){const t=end+(start-end)*i/32;profile.push(new THREE.Vector2(outer*Math.sin(t),height*Math.cos(t)));}
 for(let i=0;i<=32;i++){const t=Math.asin(o/r)+(Math.PI/2-Math.asin(o/r))*i/32;profile.push(new THREE.Vector2(r*Math.sin(t),r*Math.cos(t)));}
 profile.push(profile[0].clone());return new THREE.LatheGeometry(profile,96);
}
// A real doorway through the lower drum, aligned with the northern portico.
export function pantheonDrumDoorGeometry(){
 const s=new THREE.Shape(),start=Math.PI/2+.17,end=Math.PI*2.5-.17;
 s.absarc(0,0,12.3,start,end,false);s.absarc(0,0,11,end,start,true);s.closePath();
 const g=new THREE.ExtrudeGeometry(s,{depth:5.8,bevelEnabled:false,curveSegments:80});g.rotateX(-Math.PI/2);return g;
}
export function drawPantheon(m,base,H){
 const {add,lbox,column,roof,ring,line,local,ellipseBand,inscription}=H,{radius:r,oculusRadius:o}=PANTHEON;
 const center=local(m.x,m.z,m.angle,0,3),rotunda={...m,x:center[0],z:center[1]};
 add(pantheonDrumDoorGeometry(),center[0],base,center[1],m.angle,0xf0f0f0,false);
 ellipseBand(rotunda,12.3,12.3,1.3,5.2,base+5.8);
 for(const y of [8.1,10.7])ellipseBand(rotunda,12.48,12.48,.48,.3,base+y);
 const floor=new THREE.CircleGeometry(10.98,64);floor.rotateX(-Math.PI/2);add(floor,...[center[0],base+.24,center[1]],0,0xcacaca,false);
 for(const rad of [3.1,6.1,9.1])ring(center[0],center[1],rad,rad,base+.26,0,true);
 add(pantheonDomeGeometry(),center[0],base+11,center[1],0,0xe4e4e4,false);
 const lipY=base+11+11.6*Math.sqrt(1-(o/12.3)**2);
 const rim=new THREE.TorusGeometry(o,.12,6,72);rim.rotateX(Math.PI/2);add(rim,center[0],lipY,center[1],0,0xd0d0d0,false);
 // Coffers are inside the dome, not horizontal bands drawn across its exterior.
 const sphere=(t,a)=>[center[0]+10.98*Math.sin(t)*Math.cos(a),base+11+10.98*Math.cos(t),center[1]+10.98*Math.sin(t)*Math.sin(a)];
 for(let row=0;row<5;row++)for(let i=0;i<28;i++){
  const t=.33+row*.23,a=i*2*Math.PI/28;line([sphere(t+.02,a+.015),sphere(t+.20,a+.015),sphere(t+.20,a+2*Math.PI/28-.015),sphere(t+.02,a+2*Math.PI/28-.015),sphere(t+.02,a+.015)],true);
 }
 // Brick drum articulation and relieving arches; no anachronistic bell towers.
 for(let bay=0;bay<12;bay++){
  const angle=bay*Math.PI/6,points=[];
  for(let j=0;j<=16;j++){const t=j*Math.PI/16,u=1.55*Math.cos(t),theta=angle+u/12.34;points.push([center[0]+12.34*Math.sin(theta),base+5.1+1.55*Math.sin(t),center[1]+12.34*Math.cos(theta)]);}line(points,true);
 }
 // Three rows: eight across the front and four in each row behind, with an open central aisle.
 for(let step=0;step<3;step++)lbox(m,0,-13.6,20-step*.3,10-step*.3,.18,base+step*.18,0xe5e5e5);
 lbox(m,0,-7.6,13,3.8,9.3,base,0xe9e9e9);
 lbox(m,0,-9.53,3.6,.08,5.8,base+.5,0x8f8f8f);
 lbox(m,0,-9.60,.09,.08,5.8,base+.5,0xc4c4c4);
 // Bronze door panels and a coffered porch soffit, visible when orbiting below the roof.
 for(const u of [-1.35,-.45,.45,1.35])for(const yy of [1.1,2.65,4.2]){
  lbox(m,u,-9.65,.72,.08,1.18,base+yy,0xaaaaaa);
  lbox(m,u,-9.71,.48,.04,.88,base+yy+.15,0x8f8f8f);
 }
 for(const u of [-5.8,0,5.8])for(const v of [-16,-12.4]){
  lbox(m,u,v,4.5,2.7,.13,base+7.79,0xc4c4c4);
  for(const side of [-1,1]){
   lbox(m,u+side*2.25,v,.18,2.8,.19,base+7.71,0xe6e6e6);
   lbox(m,u,v+side*1.4,4.5,.18,.19,base+7.71,0xe6e6e6);
  }
 }
 const columns=[...Array.from({length:8},(_,i)=>[-8.05+i*2.3,-17.3]),...[-13.9,-10.5].flatMap(v=>[-8.05,-3.45,3.45,8.05].map(u=>[u,v]))];
 for(const [u,v] of columns){
  const p=local(m.x,m.z,m.angle,u,v);
  add(new THREE.CylinderGeometry(.37,.43,6.35,16),p[0],base+.7+6.35/2,p[1],0,0xc7c7c7);
  lbox(m,u,v,1.04,1.04,.22,base+.48,0xe8e8e8);
  add(new THREE.CylinderGeometry(.58,.37,.65,8),p[0],base+7.32,p[1],0,0xededed);
  for(let i=0;i<4;i++){const t=i*Math.PI/2,g=new THREE.SphereGeometry(.17,6,4);g.scale(1,1.5,1);add(g,p[0]+.43*Math.cos(t),base+7.45,p[1]+.43*Math.sin(t),0,0xe0e0e0,false);}
  lbox(m,u,v,1.15,1.15,.18,base+7.64,0xf4f4f4);
 }
 lbox(m,0,-13.7,19.5,9.7,.8,base+7.82,0xe4e4e4);
 lbox(m,0,-13.7,20,10.1,.22,base+8.62,0xf3f3f3);
 const portico=local(m.x,m.z,m.angle,0,-13.7);
 roof({...m,x:portico[0],z:portico[1],angle:m.angle+Math.PI/2},10.4,20.3,3.1,base+8.84);
 // Pediment raking cornice outlines the front triangle.
 const triangle=[[-10.15,-18.91,base+8.87],[0,-18.91,base+11.94],[10.15,-18.91,base+8.87]];
 line(triangle.map(([u,v,y])=>{const p=local(m.x,m.z,m.angle,u,v);return [p[0],y,p[1]];}));
 inscription(m,0,-18.57,base+8.18,17.8,.48,'M·AGRIPPA·L·F·COS·TERTIVM·FECIT',true);
}

export function drawTrevi(m,base,H){
 const {add,lbox,column,roof,ring,line,local,ellipseBand,inscription}=H;
 // An explicitly eighteenth-century addition: Palazzo Poli backdrop + triumphal
 // arch composition, rock shelf, Oceanus and a broad low basin. Statuary is stylized.
 // Deep niches replace the previous dark silhouettes on a solid block.
 lbox(m,0,-7.8,29,2.4,12.5,base,0xf1f1f1);
 for(const side of [-1,1])lbox(m,side*11.55,-4.5,5.9,4.2,12.5,base,0xf1f1f1);
 lbox(m,0,-4.8,17.2,5.6,1.1,base,0xe0e0e0);
 lbox(m,0,-4.8,17.2,5.6,1.7,base+10.8,0xf1f1f1);
 const frame=(u,span,opening,h,spring,y)=>{const p=local(m.x,m.z,m.angle,u,-2.8);add(archWallGeometry(span,1.3,spring,opening,h),p[0],base+y,p[1],m.angle,0xefefef);};
 frame(0,7.2,5.4,9.7,5.6,1.1);
 for(const side of [-1,1]){frame(side*6.15,5.1,2.6,8.8,3.1,2);lbox(m,side*6.15,-2.8,5.1,1.3,.9,base+1.1,0xe8e8e8);}

 for(const y of [1,12.5])lbox(m,0,-5.55,29.5,7,.35,base+y,0xdcdcdc);
 for(const y of [5,9.1])for(const side of [-1,1])lbox(m,side*11.6,-5.55,6.3,7,.35,base+y,0xdcdcdc);
 for(const side of [-1,1])for(const x of [10.3,13])for(const y of [3,6.7,10.3]){
  lbox(m,side*x,-2.21,1.3,.1,1.65,base+y,0xb6b6b6);
  lbox(m,side*x,-2.12,1.65,.24,.18,base+y-.13,0xe4e4e4);
 }
 // Recess silhouettes are capped by semicircular arches.
 function niche(u,w,h,y){
  const r=w/2,s=new THREE.Shape();s.moveTo(-r,0);s.lineTo(r,0);s.lineTo(r,h-r);s.absarc(0,h-r,r,0,Math.PI,false);s.closePath();
  const q=local(m.x,m.z,m.angle,u,-3.5);add(new THREE.ShapeGeometry(s),q[0],base+y,q[1],m.angle,0x989898,false);
 }
 niche(0,5.4,8.3,1.1);for(const side of [-1,1])niche(side*6,2.6,4.4,2);
 for(const u of [-8.2,-3.7,3.7,8.2]){
  architectureKit(H).orderedColumn(m,u,-1.1,9.4,base+1.1,.46);
 }
 lbox(m,0,-1.6,18.3,2.4,.55,base+10.85,0xe0e0e0);
 lbox(m,0,-2,18,2.5,2.3,base+11.4,0xededed);
 lbox(m,0,-2,18.6,2.8,.35,base+13.7,0xdadada);
 inscription(m,0,-.72,base+12.6,13,.7,'FONTANA DI TREVI',false);
 for(let u=-13.5;u<=13.5;u+=1.1){
  if(Math.abs(u)<9.4)continue;
  column(m,u,-2.3,.8,base+12.85,.10);
 }
 for(const side of [-1,1])lbox(m,side*11.7,-2.3,5.5,.45,.18,base+13.65,0xdddddd);
 for(let u=-8;u<8;u+=.6)lbox(m,u,-.46,.18,.18,.19,base+11.14,0xd1d1d1);
 // Central crest and four small figures on the attic balustrade.
 const crest=local(m.x,m.z,m.angle,0,-2);const shield=new THREE.SphereGeometry(.7,8,6);shield.scale(1,1.25,.35);add(shield,crest[0],base+14.55,crest[1],m.angle,0xdadada);
 function figure(u,v,y,k){
  const p=local(m.x,m.z,m.angle,u,v);
  add(new THREE.ConeGeometry(.42*k,1.35*k,7),p[0],base+y+.68*k,p[1],0,0xe2e2e2);
  add(new THREE.SphereGeometry(.24*k,8,6),p[0],base+y+1.55*k,p[1],0,0xf4f4f4,false);
  for(const side of [-1,1]){const q=local(m.x,m.z,m.angle,u+side*.38*k,v);add(new THREE.CylinderGeometry(.11*k,.14*k,.85*k,6),q[0],base+y+.94*k,q[1],0,0xe6e6e6,false);}
 }
 for(const u of [-7,-3.7,3.7,7])figure(u,-2,14.05,.62);
 for(const side of [-1,1])figure(side*6,-1.9,2,1);
 // Wide scalloped oval basin, above its floor and below its coping.
 const basinCenter=local(m.x,m.z,m.angle,0,5),basin={...m,x:basinCenter[0],z:basinCenter[1]};
 ellipseBand(basin,13.8,6.7,.65,.55,base+.15);
 const water=new THREE.CircleGeometry(1,80);water.scale(13.12,6.02,1);water.rotateX(-Math.PI/2);
 add(water,basin.x,base+.34,basin.z,m.angle,0xb7b7b7,false);
 // Irregular travertine rocks, not a geometric tiered garden fountain.
 for(let i=0;i<22;i++){
  const u=(i%11-5)*2.1,v=i<11?.6:2.1,p=local(m.x,m.z,m.angle,u,v),g=new THREE.IcosahedronGeometry(1,0);
  g.scale(1.4+(i%3)*.17,.55+(i%4)*.22,.9);add(g,p[0],base+.65,p[1],m.angle+i*.73,0xd8d8d8);
 }
 lbox(m,0,1.1,3.6,2.4,.65,base+1.05,0xe8e8e8);figure(0,.25,1.7,1.75);
 // Two sea-horse groups: body, lifted neck, head and curled tail.
 for(const side of [-1,1]){
  const p=local(m.x,m.z,m.angle,side*4,2.3),body=new THREE.SphereGeometry(1,8,6);body.scale(1.4,.6,.6);add(body,p[0],base+1.2,p[1],m.angle,0xe4e4e4);
  const q=local(m.x,m.z,m.angle,side*4.9,2);add(new THREE.ConeGeometry(.42,1.8,7),q[0],base+2,q[1],m.angle,0xe9e9e9);
  const head=new THREE.SphereGeometry(.4,8,6);head.scale(1.4,.75,.8);add(head,q[0],base+2.8,q[1],m.angle,0xe9e9e9,false);
  const t=local(m.x,m.z,m.angle,side*2.9,2.3);add(new THREE.TorusGeometry(.5,.14,5,14,Math.PI*1.55),t[0],base+1,t[1],m.angle,0xd8d8d8);
  figure(side*6.6,2.3,.75,.8);
 }
 for(const u of [-7,-2,0,2,7]){
  const points=[];for(let j=0;j<=12;j++){const t=j/12,p=local(m.x,m.z,m.angle,u,.8+4*t);points.push([p[0],base+.36+1.2*(1-t)**2,p[1]]);}line(points,true);
 }
 for(let i=0;i<3;i++)ring(basin.x,basin.z,4+i*2.5,1.4+i*.75,base+.355,m.angle,true);
}
