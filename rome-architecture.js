import * as THREE from './assets/vendor/three.module.min.js';
import {archWallGeometry} from './rome-structure-geometry.js';

// Typological reconstruction, in the existing schematic city's reserved footprints.
export const COLOSSEUM_DETAIL={bays:80,arcadeStoreys:3,atticWindows:40,seatingSectors:16};
const STONE=0xefefef, TRIM=0xdadada;
export function architectureKit(H){
 const {add,lbox,local,line,roof}=H;
 function point(m,u,v,y){const p=local(m.x,m.z,m.angle,u,v);return [p[0],y,p[1]];}
 function shifted(m,u,v,angle=0){const p=local(m.x,m.z,m.angle,u,v);return {...m,x:p[0],z:p[1],angle:m.angle+angle};}
 function orderedColumn(m,u,v,h,y,r=.28,order='corinthian'){
  const p=point(m,u,v,y);
  lbox(m,u,v,r*3,r*3,.16,y,TRIM);
  for(const [rad,yy,hh] of [[r*1.32,.16,.13],[r*1.17,.29,.1]])add(new THREE.CylinderGeometry(rad,rad,hh,12),p[0],y+yy+hh/2,p[2],0,STONE,false);
  add(new THREE.CylinderGeometry(r*.86,r,h-.85,12),p[0],y+.39+(h-.85)/2,p[2],0,0xe5e5e5,false);
  const top=y+h;
  add(new THREE.CylinderGeometry(r*1.48,r*.9,.26,12),p[0],top-.3,p[2],0,TRIM,false);
  lbox(m,u,v,r*3.1,r*3.1,.17,top-.17,STONE);
  if(order!=='doric')for(const side of [-1,1]){
   const q=point(m,u+side*r*1.05,v,top-.31);
   add(new THREE.TorusGeometry(r*.31,r*.09,4,8),...q,m.angle,TRIM,false);
  }
  // Small leaf fans, rather than an oversized cubic capital.
  if(order==='corinthian')for(let i=0;i<6;i++){
   const a=i*Math.PI/3,q=point(m,u+Math.cos(a)*r,v+Math.sin(a)*r,top-.55);
   add(new THREE.ConeGeometry(r*.29,.32,4),...q,m.angle+a,STONE,false);
  }
 }
 function cornice(m,u,v,w,d,y){
  lbox(m,u,v,w,d,.18,y,TRIM);lbox(m,u,v,w+.22,d+.22,.14,y+.18,STONE);
 }
 function arcade(m,width,count,h,y,depth=.65){
  const span=width/count,opening=span*.65,spring=h-opening/2-.45;
  for(let i=0;i<count;i++){
   const u=-width/2+(i+.5)*span,p=point(m,u,0,y);
   add(archWallGeometry(span,depth,spring,opening,h),...p,m.angle,STONE);
   // Stone wedge joints on both sides of the opening.
   for(const side of [-1,1])for(let j=0;j<=8;j++){
    const a=j*Math.PI/8,r=opening/2;
    line([point(m,u+Math.cos(a)*r,side*(depth/2+.015),y+spring+Math.sin(a)*r),point(m,u+Math.cos(a)*(r+.23),side*(depth/2+.015),y+spring+Math.sin(a)*(r+.23))],true);
   }
  }
  cornice(m,0,0,width,depth+.15,y+h);
 }
 function peristyle(m,w,d,y,h=3.6,spacing=2.5){
  for(const side of [-1,1]){
   cornice(m,0,side*(d/2-.8),w,1.6,y+h);
   cornice(m,side*(w/2-.8),0,1.6,d-3.2,y+h);
   const nx=Math.max(2,Math.floor((w-2)/spacing)),nz=Math.max(2,Math.floor((d-4)/spacing));
   for(let i=0;i<=nx;i++)orderedColumn(m,-w/2+1+i*(w-2)/nx,side*(d/2-.8),h,y,.22);
   for(let i=1;i<nz;i++)orderedColumn(m,side*(w/2-.8),-d/2+1+i*(d-2)/nz,h,y,.22);
  }
 }
 function basilica(m,w,d,y,h=5){
  lbox(m,0,0,w,d*.42,h,y,STONE);
  for(const side of [-1,1])lbox(m,side*(w/2-.25),0,.5,d,h,y,STONE);
  for(const side of [-1,1]){
   const aisle=shifted(m,0,side*d*.34);roof(aisle,w+.3,d*.34,.65,y+h);
   arcade(shifted(m,0,side*(d/2+.04)),w-1,Math.max(3,Math.floor(w/2.4)),h*.75,y,.48);
  }
  lbox(m,0,0,w,d*.42,2.3,y+h,STONE);
  for(let u=-w/2+1.2;u<w/2-.6;u+=2.25)for(const side of [-1,1]){
   lbox(m,u,side*(d*.21+.02),.8,.08,1.15,y+h+.6,0xaaaaaa);
   lbox(m,u,side*(d*.21+.09),1.1,.17,.14,y+h+.43,TRIM);
  }
  roof(m,w+.4,d*.46,1.2,y+h+2.3);cornice(m,0,0,w+.3,d+.3,y+h-.25);
 }
 return {point,shifted,orderedColumn,cornice,arcade,peristyle,basilica};
}

// A curved bay is mapped onto an ellipse; the void passes through the wall.
// Geometry at adjacent bay endpoints is shared analytically, avoiding corner gaps.
export function curvedArcadeBay(rx,rz,start,end,depth,h,openingRatio=.66){
 const delta=end-start,span=delta*Math.min(rx,rz),opening=span*openingRatio;
 const g=archWallGeometry(span,depth,h-opening/2-.45,opening,h),p=g.attributes.position;
 for(let i=0;i<p.count;i++){
  const t=start+(p.getX(i)/span+.5)*delta,offset=p.getZ(i);
  p.setXYZ(i,(rx+offset)*Math.cos(t),p.getY(i),(rz+offset)*Math.sin(t));
 }
 g.computeVertexNormals();return g;
}
export function ellipticalTier(rx,rz,innerX,innerZ,start,end,h){
 const s=new THREE.Shape();s.absellipse(0,0,rx,rz,start,end,false);
 s.absellipse(0,0,innerX,innerZ,end,start,true);s.closePath();
 const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:Math.max(3,Math.ceil((end-start)/Math.PI*48))});g.rotateX(-Math.PI/2);return g;
}
export function drawColosseum(m,base,H){
 const {add,lbox,ellipseBand,ring,line}=H,K=architectureKit(H),{point,orderedColumn}=K;
 const rx=m.w*.455,rz=m.d*.45,h=2.9,N=COLOSSEUM_DETAIL.bays;
 // Three superposed arcades: Tuscan/Doric, Ionic, then Corinthian.
 for(let level=0;level<3;level++){
  const y=base+.28+level*(h+.32);
  for(let i=0;i<N;i++){
   const a=i*2*Math.PI/N,b=(i+1)*2*Math.PI/N;
   add(curvedArcadeBay(rx,rz,a,b,.72,h),m.x,y,m.z,m.angle,STONE);
   orderedColumn(m,(rx+.43)*Math.cos(a),(rz+.43)*Math.sin(a),h,y,.105,['doric','ionic','corinthian'][level]);
  }
  ellipseBand(m,rx+.6,rz+.6,1.1,.32,y+h);
 }
 const attic=base+.28+3*(h+.32);
 ellipseBand(m,rx,rz,.85,2.0,attic);
 for(let i=0;i<N;i++){
  const t=(i+.5)*2*Math.PI/N;
  // Attic pilasters, alternating windows, and mast sockets below the crown.
  const facade=K.shifted(m,(rx+.46)*Math.cos(t),(rz+.46)*Math.sin(t),Math.atan2(rz*Math.cos(t),-rx*Math.sin(t)));
  lbox(facade,0,0,.16,.13,1.85,attic,TRIM);
  if(i%2===0)lbox(facade,.42,0,.4,.16,.62,attic+.73,0x999999);
  lbox(facade,0,0,.3,.38,.18,attic+1.6,STONE);
  const p=point(m,(rx-.1)*Math.cos(t),(rz-.1)*Math.sin(t),attic+2.65);
  add(new THREE.CylinderGeometry(.045,.045,1.8,5),...p,0,0xb6b6b6,false);
 }
 ellipseBand(m,rx+.5,rz+.5,1.3,.28,attic+2);
 // Complete arena floor (not exposed modern hypogeum) surrounded by a podium.
 const floor=new THREE.CircleGeometry(1,80);floor.scale(rx*.47,rz*.42,1);floor.rotateX(-Math.PI/2);
 add(floor,m.x,base+.25,m.z,m.angle,0xd1d1d1,false);
 ellipseBand(m,rx*.49,rz*.45,.35,1.1,base+.27);
 // Radial stair aisles separate the cunei; real gaps remain between seating sectors.
 for(let tier=0;tier<13;tier++){
  const outerX=rx-1.25-tier*.69,outerZ=rz-1.2-tier*.52,y=base+9.2-tier*.62;
  for(let sector=0;sector<16;sector++){
   const a=sector*Math.PI/8+.016,b=(sector+1)*Math.PI/8-.016;
   add(ellipticalTier(outerX,outerZ,outerX-.69,outerZ-.52,a,b,y-base+.24),m.x,base,m.z,m.angle,0xe3e3e3);
  }
  for(let sector=0;sector<16;sector++){
   const a=sector*Math.PI/8;
   for(let j=0;j<2;j++){
    const ux=(outerX-j*.345)*Math.cos(a),vz=-(outerZ-j*.26)*Math.sin(a);
    const stair=K.shifted(m,ux,vz,Math.atan2(Math.cos(a),Math.sin(a)));
    lbox(stair,0,0,.52,.4,y-base+.34-j*.3,base,0xd8d8d8);
   }
  }
 }
 for(const side of [-1,1]){
  const portal=K.shifted(m,side*rx*.52,0,Math.PI/2);
  K.arcade(portal,2,1,2.1,base+.28,.5);
 }
 ring(m.x,m.z,rx+.66,rz+.66,base+.24,m.angle,true);
}

export function drawTheatre(m,base,H){
 const K=architectureKit(H),{add,lbox}=H,rx=m.w*.455,rz=m.d*.70,center=K.shifted(m,0,m.d*.30);
 // Semicircular exterior, two arcaded storeys; no medieval apartments above it.
 for(let level=0;level<2;level++){
  for(let i=0;i<30;i++)add(curvedArcadeBay(rx,rz,Math.PI+i*Math.PI/30,Math.PI+(i+1)*Math.PI/30,.65,3),center.x,base+level*3.3,center.z,m.angle,STONE);
  add(ellipticalTier(rx+.35,rz+.35,rx-.8,rz-.8,0,Math.PI,.3),center.x,base+3+level*3.3,center.z,m.angle,TRIM);
 }
 for(let tier=0;tier<11;tier++)for(let sector=0;sector<10;sector++){
  const a=sector*Math.PI/10+.018,b=(sector+1)*Math.PI/10-.018;
  add(ellipticalTier(rx-1-tier*.78,rz-1-tier*1.06,rx-1.78-tier*.78,rz-2.06-tier*1.06,a,b,6.66-tier*.51),center.x,base,center.z,m.angle,0xe4e4e4);
 }
 const orchestra=new THREE.CircleGeometry(4.5,40,0,Math.PI);orchestra.rotateX(-Math.PI/2);
 add(orchestra,center.x,base+.28,center.z,m.angle,0xcacaca,false);
 lbox(m,0,m.d*.34,m.w*.84,2.5,1,base,TRIM);
 // Scaenae frons: three portals, two column orders and projecting entablatures.
 const stage=K.shifted(m,0,m.d*.43);lbox(stage,0,0,m.w*.91,2.7,7.3,base,STONE);
 for(const u of [-m.w*.27,0,m.w*.27]){
  lbox(stage,u,-1.37,1.4,.1,2.65,base+1,0x939393);
  for(const side of [-1,1])for(let level=0;level<2;level++)K.orderedColumn(stage,u+side*1.35,-1.75,2.9,base+1+level*3.2,.23);
  for(let level=0;level<2;level++)K.cornice(stage,u,-1.65,4,1.2,base+3.9+level*3.2);
 }
 // Backstage elevation has masonry bays too, rather than one blank rectangular slab.
 for(let u=-m.w*.42;u<=m.w*.43;u+=2.7){
  lbox(stage,u,1.42,.28,.24,7.15,base,TRIM);
  if(Math.abs(u)<m.w*.36)lbox(stage,u+1.15,1.38,.72,.09,1.3,base+4.6,0xb0b0b0);
 }
 for(const y of [1,4.1,7.2])K.cornice(stage,0,1.4,m.w*.92,.4,base+y);
 H.roof(stage,m.w*.95,3.2,.8,base+7.5);
}

export function drawTemple(m,base,H,{w=m.w*.67,d=m.d*.66,triple=m.id==='capitoline'}={}){
 const K=architectureKit(H),{lbox,roof}=H,podium=1.5,h=5.2;
 // Deep frontal pronaos, elevated podium and one frontal stair, not a Greek stylobate.
 lbox(m,0,0,w,d,podium,base,0xdcdcdc);
 for(let s=0;s<6;s++)lbox(m,0,-d/2-1.5+s*.25,w*.62,3-s*.5,.25,base+s*.25,STONE);
 K.cornice(m,0,0,w+.25,d+.25,base+podium-.3);
 if(triple){
  for(const side of [-1,0,1]){
   lbox(m,side*w*.215,d*.14,w*.20,d*.52,h,base+podium,STONE);
   lbox(m,side*w*.215,-d*.125,w*.10,.08,h*.64,base+podium,0x999999);
  }
 }else{
  lbox(m,0,d*.12,w*.60,d*.57,h,base+podium,STONE);
  lbox(m,0,-d*.169,w*.20,.07,h*.72,base+podium,0x999999);
  for(const side of [-1,1])lbox(m,side*w*.135,-d*.19,.28,.25,h*.8,base+podium,TRIM);
 }
 for(let i=0;i<6;i++)K.orderedColumn(m,-w*.43+i*w*.86/5,-d*.43,h,base+podium,.3);
 for(const side of [-1,1])for(let j=1;j<6;j++)K.orderedColumn(m,side*w*.43,-d*.43+j*d*.86/5,h,base+podium,.3);
 K.cornice(m,0,0,w+1,d+1,base+podium+h);
 roof({...m,angle:m.angle+Math.PI/2},d+1.4,w+1.4,2.2,base+podium+h+.32);
 const front=-d/2-.72,yy=base+podium+h+.35;
 H.line([K.point(m,-w/2-.7,front,yy),K.point(m,0,front,yy+2.2),K.point(m,w/2+.7,front,yy)]);
 for(let u=-w/2;u<=w/2;u+=.6)lbox(m,u,front,.19,.22,.18,yy-.17,TRIM);
}

export function drawForum(m,base,H){
 const K=architectureKit(H),{lbox,add,line}=H;
 if(m.id==='trajan'){
  // Distinct axial precinct: open square → transverse Basilica Ulpia → column court.
  const plaza=K.shifted(m,0,m.d*.18);K.peristyle(plaza,m.w*.90,m.d*.44,base+.2,3.3);
  const hall=K.shifted(m,0,-m.d*.105);K.basilica(hall,m.w*.78,m.d*.145,base+.2,5.5);
  for(const side of [-1,1]){
   const p=K.point(m,side*m.w*.375,-m.d*.105,base+2.5);
   add(new THREE.CylinderGeometry(m.d*.072,m.d*.072,4.6,24),...p,m.angle,STONE);
   H.roof(K.shifted(m,side*m.w*.29,-m.d*.34),m.w*.23,m.d*.16,1.2,base+4.6);
   lbox(m,side*m.w*.29,-m.d*.34,m.w*.23,m.d*.16,4.6,base,STONE);
   for(let i=0;i<3;i++)K.orderedColumn(m,side*m.w*.29+(i-1)*1.9,-m.d*.25,3.8,base+.2,.24);
  }
  const c=K.shifted(m,0,-m.d*.34);lbox(c,0,0,3,3,1.5,base,TRIM);
  K.orderedColumn(c,0,0,10.5,base+1.5,.58,'doric');
  const spiral=[];for(let i=0;i<=420;i++){const t=i/420,a=t*Math.PI*2*18;spiral.push(K.point(c,.59*Math.cos(a),.59*Math.sin(a),base+2+t*9.4));}line(spiral,true);
  add(new THREE.ConeGeometry(.32,1.0,7),...K.point(c,0,0,base+12.55),0,TRIM);
  // Equestrian base in the open forum, not another monumental column.
  lbox(plaza,0,0,2.8,1.8,1.2,base+.2,TRIM);
  const horse=new THREE.SphereGeometry(.65,8,5);horse.scale(1.4,.65,.55);add(horse,...K.point(plaza,0,0,base+2),m.angle,TRIM,false);
  for(const u of [-.6,.6])for(const v of [-.22,.22])lbox(plaza,u,v,.13,.13,.6,base+1.4,TRIM);
  const neck=new THREE.ConeGeometry(.26,.8,7);add(neck,...K.point(plaza,.6,0,base+2.5),m.angle,TRIM,false);
  const head=new THREE.SphereGeometry(.24,7,5);head.scale(1.6,.7,.75);add(head,...K.point(plaza,.8,0,base+2.9),m.angle,TRIM,false);
  add(new THREE.CylinderGeometry(.19,.25,.65,7),...K.point(plaza,-.1,0,base+2.6),m.angle,TRIM,false);
  add(new THREE.SphereGeometry(.18,7,5),...K.point(plaza,-.1,0,base+3.06),0,TRIM,false);
 }else{
  // Asymmetric Roman Forum: basilicas flank a civic square and a temple group.
  for(const side of [-1,1])K.basilica(K.shifted(m,2,side*m.d*.34),m.w*.64,m.d*.21,base+.2,side<0?4.3:3.8);
  drawTemple(K.shifted(m,-m.w*.36,-.5,Math.PI/2),base,H,{w:8,d:10,triple:false});
  const arch=K.shifted(m,m.w*.40,0,Math.PI/2);K.arcade(arch,6,3,3.8,base+.2,1.6);lbox(arch,0,0,6.3,1.9,1.1,base+4.3,STONE);
  lbox(m,-m.w*.20,1,3.2,5,1.1,base+.2,TRIM); // rostra
  const shrine=K.shifted(m,m.w*.21,m.d*.03);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;K.orderedColumn(shrine,2*Math.cos(a),2*Math.sin(a),3,base+.25,.17);}
  add(new THREE.ConeGeometry(2.4,1.25,24),...K.point(shrine,0,0,base+3.9),0,0xdddddd);
  for(const u of [-5,2,9]){lbox(m,u,0,1.2,1.2,.65,base+.2,TRIM);K.orderedColumn(m,u,0,3.1,base+.85,.19);}
 }
 // Quiet slab joints across the plaza; avoid graphic grid lines over the buildings.
 for(let u=-m.w*.22;u<m.w*.23;u+=2.3)line([K.point(m,u,-1.8,base+.215),K.point(m,u,1.8,base+.215)],true);
}

export function drawPalace(m,base,H){
 const K=architectureKit(H),{lbox,add,roof}=H;
 const court=K.shifted(m,-m.w*.07,m.d*.06);
 K.peristyle(court,m.w*.47,m.d*.41,base+.2,4.1);
 // Domus Flavia's reception range and triclinium frame an OPEN peristyle.
 const aula=K.shifted(m,-m.w*.04,-m.d*.325);
 K.basilica(aula,m.w*.37,m.d*.22,base+.2,8);
 for(const side of [-1,1]){
  const wing=K.shifted(m,side*m.w*.365,-m.d*.15);K.basilica({...wing,angle:wing.angle+Math.PI/2},m.d*.55,m.w*.15,base+.2,5);
  for(let i=0;i<4;i++)lbox(m,side*m.w*.45,-m.d*.4+i*m.d*.19,.6,m.d*.12,5,base,TRIM);
 }
 const dining=K.shifted(m,-m.w*.05,m.d*.37);K.basilica(dining,m.w*.43,m.d*.16,base+.2,5.4);
 // Octagonal ornamental basin; the visible garden isn't covered by a central hall.
 const fountain=K.shifted(court,0,0);H.ellipseBand(fountain,3.6,3.6,.45,.65,base+.2);
 const floor=new THREE.CircleGeometry(3.1,8);floor.rotateX(-Math.PI/2);add(floor,fountain.x,base+.4,fountain.z,0,0xbdbdbd,false);
 for(const side of [-1,1]){
  const garden=K.shifted(m,side*m.w*.29,m.d*.32);
  H.ellipseBand(garden,2.2,3.3,.32,.4,base+.2);
 }
 // East residential court, smaller and lower than the ceremonial palace.
 const privateCourt=K.shifted(m,m.w*.34,m.d*.25);K.peristyle(privateCourt,m.w*.20,m.d*.34,base+.2,2.9,2.2);
}

export function detailBaths(m,base,H){
 const K=architectureKit(H),{lbox,line}=H,w=m.w,d=m.d;
 // Articulated pool backdrop: paired pilasters, shallow niches, stacked cornices.
 const screen=K.shifted(m,0,-d*.365);lbox(screen,0,0,w*.35,.65,4.4,base,STONE);
 for(let i=-2;i<=2;i++){
  const u=i*w*.062;lbox(screen,u,.34,w*.036,.08,2.6,base+.6,0xb4b4b4);
  for(const side of [-1,1])K.orderedColumn(screen,u+side*w*.022,.6,3.7,base+.2,.23);
 }
 K.cornice(screen,0,0,w*.36,1,base+4.4);
 // Buttresses define the three large frigidarium bays; cornices sit below the roofs.
 for(const side of [-1,1]){
  for(let i=0;i<=3;i++)lbox(m,-w*.19+i*w*.38/3,-d*.035+side*d*.116,.6,1.15,7.4,base,TRIM);
  K.cornice(m,0,-d*.035+side*d*.107,w*.39,.5,base+7.55);
  const entrance=K.shifted(m,side*w*.31,d*.40);K.arcade(entrance,w*.20,3,3,base,.65);
  // External exedrae beside the exercise courts, with visible half-round roofs.
  const exedra=K.shifted(m,side*w*.415,d*.025,side*Math.PI/2);
  const r=d*.065;const drum=new THREE.CylinderGeometry(r,r,3.4,24,1,false,0,Math.PI);
  H.add(drum,exedra.x,base+1.7,exedra.z,exedra.angle,STONE);
  const dome=new THREE.SphereGeometry(r,24,10,0,Math.PI,0,Math.PI/2);H.add(dome,exedra.x,base+3.4,exedra.z,exedra.angle,0xe0e0e0,false);
 }
}

export function detailVenue(c,length,width,base,H){
 const K=architectureKit(H),radius=width/2-1,curveCenter=length/2-1-radius,start=-length/2+3;
 // Arcaded substructures at the outside of the long stands, not in the racing lane.
 const facadeLength=curveCenter-start;
 for(const side of [-1,1])K.arcade(K.shifted(c,(start+curveCenter)/2,side*(radius+.12)),facadeLength,Math.max(8,Math.floor(facadeLength/2.2)),3.0,base,.4);
 const center=K.shifted(c,curveCenter,0);
 for(let i=0;i<18;i++)H.add(curvedArcadeBay(radius+.12,radius+.12,-Math.PI/2+i*Math.PI/18,-Math.PI/2+(i+1)*Math.PI/18,.4,3),center.x,base,center.z,c.angle,STONE);
 // Distributed stair divisions articulate otherwise featureless ribbons of seating.
 for(let u=start+4;u<curveCenter-1;u+=8)for(const side of [-1,1])for(let s=0;s<8;s++)H.lbox(c,u,side*(radius-.4-s*.52),.48,.52,.2,base+4.15-s*.43,0xd6d6d6);
}
