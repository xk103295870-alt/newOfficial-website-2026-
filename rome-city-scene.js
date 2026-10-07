import {PUBLIC_FIXTURES,plazaPoint} from './rome-public-space-plan.js';
import {drawColosseum,drawTheatre,drawTemple,drawForum,drawPalace,detailBaths,detailVenue} from './rome-architecture.js';
import { viewAngles, advanceAngles, orbitDirection, wrapAngle, rotationDegrees } from './rome-camera-controls.js';
import { drawPantheon, drawTrevi } from './rome-monuments.js';
import { COUNTRY_BOUNDARY, COUNTRY_RIVER, createCountrysidePlan } from './rome-countryside-plan.js';
import { samplePolyline, roundRiver, ribbonSections, offsetPoint, riverTerrainHeight, stripPositions } from './rome-landscape-plan.js';
import { gradedBoxGeometry, archWallGeometry } from './rome-structure-geometry.js';
import { BRIDGE_DECK, BRIDGE_APPROACH, AQUEDUCT_SLOPE, streetHeight, channelHeight } from './rome-engineering-plan.js';
import { bathLevels, bathCoping } from './rome-bath-plan.js';
import { createLifePlan, sampleWalk, personMotion } from './rome-city-life.js';
import { venuePlan } from './rome-venue-plan.js';
import * as THREE from './assets/vendor/three.module.min.js';
import {CITY_BOUNDARY,RIVER,RIVER_WIDTH,LANDMARKS,DISTRICTS,ROADS,createCityPlan,heightAt,inside,pathDistance,landmarkContains,BRIDGES,AQUEDUCT} from './rome-city-layout.js';

export async function mountRomeCityScene(host) {
 const scene=new THREE.Scene();scene.background=new THREE.Color(0xf4f4f4);
 const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 host.appendChild(renderer.domElement);const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','罗马城市：拖动平移，Shift加拖动或Q/E旋转，滚轮缩放');canvas.dataset.enLabel='Roman city — drag to pan, Shift-drag or Q/E to rotate, scroll to zoom';
 const abort=new AbortController(),on=(el,type,fn,options={})=>el.addEventListener(type,fn,{...options,signal:abort.signal});
 const camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,2400);
 const target=new THREE.Vector3(0,0,-25),desired=target.clone(),direction=new THREE.Vector3(1,.98,1).normalize();
 let zoom=1,zoomTarget=1,halfH=270,width=0,height=0,disposed=false,raf=0,paused=false,selected=null,following=false;
 let orbit=viewAngles('all'),orbitTarget={...orbit},rotateMode=false;
 const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
 const materials=new Map(),geometries=new Set(),monumentTextures=[];
 scene.add(new THREE.AmbientLight(0xffffff,2.4));
 const sunlight=new THREE.DirectionalLight(0xffffff,.7);sunlight.position.set(-150,300,120);scene.add(sunlight);
 const mat=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshLambertMaterial({color,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1}));return materials.get(color);};
 const ink=new THREE.LineBasicMaterial({color:0x777777,transparent:true,opacity:.67});
 const fineInk=new THREE.LineBasicMaterial({color:0x989898,transparent:true,opacity:.46});
 // Merge static geometry by material: city density does not multiply draw calls.
 const batches=new Map(),edgePositions=[],detailPositions=[];
 const matrix=new THREE.Matrix4(),quaternion=new THREE.Quaternion(),axis=new THREE.Vector3(0,1,0),one=new THREE.Vector3(1,1,1);
 function add(geo,x=0,y=0,z=0,angle=0,color=0xfafafa,outlined=true){
  matrix.compose(new THREE.Vector3(x,y,z),quaternion.setFromAxisAngle(axis,angle),one);
  if(outlined){const e=new THREE.EdgesGeometry(geo,25);e.applyMatrix4(matrix);edgePositions.push(...e.attributes.position.array);e.dispose();}
  let g=geo.index?geo.toNonIndexed():geo.clone();g.applyMatrix4(matrix);if(!batches.has(color))batches.set(color,[]);const out=batches.get(color);const a=g.attributes.position.array;for(let i=0;i<a.length;i++)out.push(a[i]);g.dispose();geo.dispose();
 }
 function line(points,detail=false){const a=detail?detailPositions:edgePositions;for(let i=1;i<points.length;i++)a.push(...points[i-1],...points[i]);}
 function box(x,z,w,d,h,y=0,a=0,color=0xfafafa){add(new THREE.BoxGeometry(w,h,d),x,y+h/2,z,a,color);}
 function local(cx,cz,a,u,v){return [cx+u*Math.cos(a)+v*Math.sin(a),cz-u*Math.sin(a)+v*Math.cos(a)];}
 function lbox(m,u,v,w,d,h,y=0,color=0xfafafa){const [x,z]=local(m.x,m.z,m.angle,u,v);box(x,z,w,d,h,y,m.angle,color);}
 // Shared cross-sections make bends watertight, instead of isolated rectangles.
 function strip(sections,left,right,elevation,color){
  const pos=stripPositions(sections,left,right,elevation);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));add(g,0,0,0,0,color,false);
 }
 const ROAD_COLOR=0xdfdfdf;
 // Irregular stone joints, not modern asphalt or lane markings. A shared world UV
 // keeps identical paving at intersections, even where two road meshes overlap.
 const paving=document.createElement('canvas');paving.width=paving.height=512;
 const paint=paving.getContext('2d');paint.fillStyle='#bdbdbd';paint.fillRect(0,0,512,512);
 let stoneSeed=407;const stoneRandom=()=>((stoneSeed=(Math.imul(stoneSeed,1664525)+1013904223)>>>0)/4294967296);
 const cols=16,cell=512/cols,vertices=[];
 for(let z=0;z<=cols;z++){const row=[];for(let x=0;x<=cols;x++)row.push([x*cell+(x&&x<cols?(stoneRandom()-.5)*cell*.48:0),z*cell+(z&&z<cols?(stoneRandom()-.5)*cell*.48:0)]);vertices.push(row);}
 for(let z=0;z<cols;z++)for(let x=0;x<cols;x++){
  const shade=218+Math.floor(stoneRandom()*16);paint.fillStyle=`rgb(${shade},${shade},${shade})`;paint.strokeStyle='#b8b8b8';paint.lineWidth=.8;paint.beginPath();
  for(const [i,j] of [[x,z],[x+1,z],[x+1,z+1],[x,z+1]]){const q=vertices[j][i];paint.lineTo(...q);}paint.closePath();paint.fill();paint.stroke();
 }
 const pavingTexture=new THREE.CanvasTexture(paving);pavingTexture.wrapS=pavingTexture.wrapT=THREE.RepeatWrapping;pavingTexture.colorSpace=THREE.SRGBColorSpace;pavingTexture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 materials.set(ROAD_COLOR,new THREE.MeshBasicMaterial({map:pavingTexture,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1}));
 const bridgeFootprint=p=>BRIDGES.some(b=>landmarkContains(p,{...b,w:b.w+2*BRIDGE_APPROACH},.2));
 function roadNetwork(plan){
  for(const road of plan.streets){
   const sections=ribbonSections(samplePolyline(road.points,.9)),half=road.width/2;
   // Do not draw a second ground-level road across the water under a bridge.
   let run=[];const flush=()=>{if(run.length>1)strip(run,-half,half,p=>heightAt(...p)+.085,ROAD_COLOR);run=[];};
   for(let i=1;i<sections.length;i++){
    if(bridgeFootprint(sections[i-1].p)&&bridgeFootprint(sections[i].p)){flush();continue;}
    if(!run.length)run.push(sections[i-1]);run.push(sections[i]);
   }flush();
   // Curbs and shallow drainage joints stop at junctions and bridge approaches.
   for(const side of [-1,1])for(let i=1;i<sections.length;i++){
    const p=offsetPoint(sections[i-1],side*(half-.1)),q=offsetPoint(sections[i],side*(half-.1)),mid=[(p[0]+q[0])/2,(p[1]+q[1])/2];
    const hidden=[p,mid,q].some(point=>bridgeFootprint(point)||plan.streets.some(other=>other!==road&&pathDistance(point,other.points)<other.width/2+.22));
    if(hidden)continue;
    strip([sections[i-1],sections[i]],side*(half-.20),side*half,p=>heightAt(...p)+.17,0xd5d5d5);
    line([p,q].map(p=>[p[0],heightAt(...p)+.185,p[1]]),true);
   }
  }
 }
 function ring(cx,cz,rx,rz,y,a=0,detail=false){const points=[];for(let i=0;i<=96;i++){const t=i/96*Math.PI*2,p=local(cx,cz,a,Math.cos(t)*rx,Math.sin(t)*rz);points.push([p[0],y,p[1]]);}line(points,detail);}
 function ellipseBand(m,rx,rz,thickness,h,y=0){
  const s=new THREE.Shape();s.absellipse(0,0,rx,rz,0,Math.PI*2,false,0);const hole=new THREE.Path();hole.absellipse(0,0,rx-thickness,rz-thickness,0,Math.PI*2,true,0);s.holes.push(hole);
  const g=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:64});g.rotateX(-Math.PI/2);add(g,m.x,y,m.z,m.angle,0xf5f5f5,false);ring(m.x,m.z,rx,rz,y+h,m.angle);ring(m.x,m.z,rx-thickness,rz-thickness,y+h,m.angle,true);
 }
 function column(m,u,v,h=5,y=0,r=.38){const p=local(m.x,m.z,m.angle,u,v);add(new THREE.CylinderGeometry(r,r*1.14,h,6),p[0],y+h/2,p[1],0,0xfafafa);}
 function roof(m,w,d,h,y){
  const hw=w/2,hd=d/2;const vertices=[[-hw,0,-hd],[hw,0,-hd],[hw,0,hd],[-hw,0,hd],[-hw,h,0],[hw,h,0]],pos=[];
  for(const i of [0,1,5,0,5,4,3,4,5,3,5,2,0,4,3,1,2,5])pos.push(...vertices[i]);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));add(g,m.x,y,m.z,m.angle,0xe5e5e5);
  for(let u=-hw+1;u<hw;u+=1.15){const p=local(m.x,m.z,m.angle,u,-hd),q=local(m.x,m.z,m.angle,u,0),r=local(m.x,m.z,m.angle,u,hd);line([[p[0],y,p[1]],[q[0],y+h,q[1]],[r[0],y,r[1]]],true);}
 }
 function inscription(m,u,v,y,w,h,text,reverse){
  const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=96;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#dedede';ctx.fillRect(0,0,1536,96);ctx.fillStyle='#777';ctx.font='48px Georgia, serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,768,49,1450);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;monumentTextures.push(texture);
  const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});materials.set(texture,material);
  const geometry=new THREE.PlaneGeometry(w,h);geometries.add(geometry);const mesh=new THREE.Mesh(geometry,material),p=local(m.x,m.z,m.angle,u,v);
  mesh.position.set(p[0],y,p[1]);mesh.rotation.y=m.angle+(reverse?Math.PI:0);scene.add(mesh);
 }
 const monumentHelpers={add,lbox,column,roof,ring,line,local,ellipseBand,inscription};
 // Distinct bath plans: axial pools/halls, lateral palaestrae, and different caldaria.
 // Architectural massing only; see notes/rome-reconstruction.md for evidence limits.
 function bathHall(m,u,v,w,d,h,base,vaults=1){
  const center=local(m.x,m.z,m.angle,u,v),hall={...m,x:center[0],z:center[1]};
  lbox(hall,0,0,w,d,h,base,0xf3f3f3);
  // The vaults are internal structure. Exterior reconstructions show tiled roofs
  // and clerestory arches, not exposed rows of inflated concrete shells.
  for(let bay=0;bay<vaults;bay++){
   const bw=w/vaults,uc=-w/2+bw*(bay+.5),p=local(hall.x,hall.z,hall.angle,uc,0);
   roof({...hall,x:p[0],z:p[1],angle:hall.angle+Math.PI/2},d+.5,bw+.12,Math.min(bw,d)*.20,base+h);
   for(const side of [-1,1]){
    const r=Math.min(bw*.29,h*.27),win=new THREE.Shape();
    win.moveTo(-r,0);win.lineTo(r,0);win.lineTo(r,r*.5);win.absarc(0,r*.5,r,0,Math.PI,false);win.closePath();
    const q=local(hall.x,hall.z,hall.angle,uc,side*(d/2+.03));
    add(new THREE.ShapeGeometry(win),q[0],base+h-r*1.8,q[1],hall.angle,0xb8b8b8,false);
    for(const split of [-.33,.33])lbox(hall,uc+r*split,side*(d/2+.06),.13,.09,r*1.32,base+h-r*1.8,0xeeeeee);
   }
  }
  // Thermal windows and cornices on the short elevations remain visible when orbiting.
  for(const side of [-1,1]){
   const r=Math.min(d*.28,h*.25),win=new THREE.Shape();
   win.moveTo(-r,0);win.lineTo(r,0);win.lineTo(r,r*.42);win.absarc(0,r*.42,r,0,Math.PI,false);win.closePath();
   const p=local(hall.x,hall.z,hall.angle,side*(w/2+.025),0);
   add(new THREE.ShapeGeometry(win),p[0],base+h-r*1.72,p[1],hall.angle+Math.PI/2,0xb0b0b0,false);
   for(const split of [-.34,.34])lbox(hall,side*(w/2+.055),r*split,.1,.13,r*1.3,base+h-r*1.72,0xececec);
   lbox(hall,side*(w/2+.04),0,.18,d+.12,.2,base+h-.22,0xd9d9d9);
   for(const edge of [-1,1])lbox(hall,side*(w/2-.15),edge*(d/2+.05),.3,.18,h-.3,base,0xe4e4e4);
  }
 }
 function courtyard(m,u,v,w,d,base){
  lbox(m,u,v,w,d,.18,base,0xe8e8e8);
  for(const side of [-1,1]){
   lbox(m,u,v+side*(d/2-1.3),w,2.6,.55,base+3.5,0xf8f8f8);
   lbox(m,u+side*(w/2-1.3),v,2.6,d-5.2,.55,base+3.5,0xf8f8f8);
   for(let x=-w/2+2;x<w/2-1;x+=2.1)column(m,u+x,v+side*(d/2-1.5),3.5,base,.23);
   for(let z=-d/2+3;z<d/2-2;z+=2.1)column(m,u+side*(w/2-1.5),v+z,3.5,base,.23);
  }
 }
 function baths(m,base){
  const levels=bathLevels(base);base=levels.floor;
  const caracalla=m.id==='caracalla',w=m.w,d=m.d;
  // Natatio: an open-air swimming basin on the cooler north side, not a domed room.
  // A single opaque surface above the podium: no coplanar box top/bottom or alpha sorting.
  const pool=new THREE.PlaneGeometry(w*.30,d*.16);pool.rotateX(-Math.PI/2);
  const poolCenter=local(m.x,m.z,m.angle,0,-d*.27);
  add(pool,poolCenter[0],levels.water,poolCenter[1],m.angle,0xbfbfbf,false);
  for(const rim of bathCoping(w,d))lbox(m,rim.u,rim.v-d*.27,rim.w,rim.d,levels.copingTop-base,base,0xe6e6e6);
  for(const side of [-1,1]){
   courtyard(m,side*w*.335,-d*.015,w*.24,d*.36,base);
   // Changing/service rooms frame the pools instead of four continuous giant walls.
   for(let i=0;i<3;i++)bathHall(m,side*(w*.24+i*w*.078),-d*.34,w*.07,d*.13,3.8,base);
   for(let i=0;i<2;i++)bathHall(m,side*(w*.265+i*w*.12),d*.30,w*.105,d*.18,4.6,base);
  }
  bathHall(m,0,-d*.035,w*.38,d*.21,7.8,base,3); // frigidarium, three vaulted bays
  bathHall(m,0,d*.078,w*.13,d*.018,3.5,base); // short enclosed link between the cold and warm halls
  bathHall(m,0,d*.135,w*.16,d*.10,4.5,base); // smaller tepidarium
  if(caracalla){
   // Caracalla's projecting circular caldarium, on the southern end of the main axis.
   const p=local(m.x,m.z,m.angle,0,d*.31),r=w*.115;
   const bays=8,span=2*Math.PI*r/bays,opening=span*.64,h=5.8;
   for(let bay=0;bay<bays;bay++){
    const g=archWallGeometry(span,.65,h-opening/2-.65,opening,h),vertices=g.attributes.position;
    for(let i=0;i<vertices.count;i++){
     const theta=vertices.getX(i)/r+(bay+.5)*Math.PI*2/bays;
     const radius=r+vertices.getZ(i);
     vertices.setXYZ(i,Math.sin(theta)*radius,vertices.getY(i),Math.cos(theta)*radius);
    }
    add(g,p[0],base,p[1],m.angle,0xf3f3f3);
   }
   // Continuous cornice and dome rest on the eight piers; openings reveal the interior.
   ellipseBand({...m,x:p[0],z:p[1]},r+.25,r+.25,.85,.4,base+h);
   add(new THREE.SphereGeometry(r,32,16,0,Math.PI*2,0,Math.PI/2),p[0],base+h+.4,p[1],0,0xe4e4e4,false);
   ring(p[0],p[1],r,r,base+h+.4);
  }else{
   // Diocletian: a rectangular hot hall with projecting apses, not a second rotunda.
   bathHall(m,0,d*.30,w*.25,d*.19,6,base,2);
   for(const side of [-1,1]){
    const p=local(m.x,m.z,m.angle,side*w*.12,d*.30),r=d*.066;
    add(new THREE.CylinderGeometry(r,r,4.8,20),p[0],base+2.4,p[1],0,0xf1f1f1);
    add(new THREE.SphereGeometry(r,20,8,0,Math.PI*2,0,Math.PI/2),p[0],base+4.8,p[1],0,0xe4e4e4,false);
   }
  }
  // Continuous outer service wings enclose the bathing block, with open palaestrae.
  for(const side of [-1,1])bathHall(m,side*w*.455,-d*.025,w*.07,d*.75,3.8,base);
  bathHall(m,0,-d*.44,w*.92,d*.07,4.3,base,7);
  // Low precinct boundary and a real entrance gap, keeping the courtyards legible.
  for(const side of [-1,1])lbox(m,side*(w/2-1),0,.8,d-2,1.1,base,0xd8d8d8);
  lbox(m,0,-d/2+1,w-2,.8,1.1,base,0xd8d8d8);
  for(const side of [-1,1])lbox(m,side*w*.3,d/2-1,w*.36,.8,1.1,base,0xd8d8d8);
 }
 function masonryArch(m,u,span,depth,spring,opening,top,base=0,grade=0){
  const r=opening/2,geo=archWallGeometry(span,depth,spring,opening,top,grade);
  const center=local(m.x,m.z,m.angle,u,0);add(geo,center[0],base,center[1],m.angle,0xe3e3e3);
  // Radial voussoir joints make the load-bearing stone arch readable at close range.
  for(const side of [-1,1])for(let j=0;j<=12;j++){
   const t=j/12*Math.PI,a=local(m.x,m.z,m.angle,u+Math.cos(t)*r,side*(depth/2+.02)),b=local(m.x,m.z,m.angle,u+Math.cos(t)*(r+.45),side*(depth/2+.02));
   line([[a[0],base+spring+Math.sin(t)*r,a[1]],[b[0],base+spring+Math.sin(t)*(r+.45),b[1]]],true);
  }
 }
 function stoneBridge(b){
  const spans=5,span=b.w/spans;
  for(let i=0;i<spans;i++)masonryArch(b,-b.w/2+(i+.5)*span,span,b.d-.6,1.45,span-1.2,BRIDGE_DECK+.85,-1.1);
  lbox(b,0,0,b.w,b.d,.25,BRIDGE_DECK-.25,ROAD_COLOR);
  for(const side of [-1,1])lbox(b,0,side*(b.d/2-.2),b.w,.4,.75,BRIDGE_DECK,0xd5d5d5);
  // Triangular cutwaters protect the upstream/downstream faces of the river piers.
  for(let i=1;i<spans;i++)for(const side of [-1,1]){
   const q=local(b.x,b.z,b.angle,-b.w/2+i*span,side*(b.d/2+.15));
   add(new THREE.CylinderGeometry(.72,.92,2.6,3),q[0],.5,q[1],b.angle+(side>0?0:Math.PI),0xdddddd);
  }
  // Solid embanked approaches, not floating sheets. Geometry and traffic share
  // the same linear deck profile, including the parapet continuing down to land.
  for(const side of [-1,1]){
   const shape=new THREE.Shape(),u0=side*b.w/2,u1=side*(b.w/2+BRIDGE_APPROACH);
   shape.moveTo(u0,0);shape.lineTo(u0,BRIDGE_DECK);shape.lineTo(u1,.12);shape.lineTo(u1,0);shape.closePath();
   const ramp=new THREE.ExtrudeGeometry(shape,{depth:b.d,bevelEnabled:false});ramp.translate(0,0,-b.d/2);
   add(ramp,b.x,0,b.z,b.angle,ROAD_COLOR);
   const u=side*(b.w/2+BRIDGE_APPROACH/2),grade=-side*(BRIDGE_DECK-.12)/BRIDGE_APPROACH;
   for(const edge of [-1,1])gradedBlock(b,u,edge*(b.d/2-.2),BRIDGE_APPROACH,.4,.75,(BRIDGE_DECK+.12)/2,grade,0xd5d5d5);
  }
 }
 // Shear only the elevation: every adjoining section meets at an identical level.
 function gradedBlock(m,u,v,w,d,h,y,grade,color){
  const g=gradedBoxGeometry(w,h,d,grade);
  const q=local(m.x,m.z,m.angle,u,v);add(g,q[0],y+h/2,q[1],m.angle,color);
 }
 function romanAqueduct(){
  const [a,b]=AQUEDUCT,dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),count=Math.ceil(length/6.3),span=length/count;
  const m={x:a[0],z:a[1],angle:-Math.atan2(dz,dx)};
  // One continuous graded bed and side walls: no staircase at the arch boundaries.
  const mid=length/2,top=channelHeight(mid);
  gradedBlock(m,mid,0,length,2.3,.22,top-.2,AQUEDUCT_SLOPE,0xcccccc);
  for(const side of [-1,1])gradedBlock(m,mid,side*.99,length,.32,1,top,AQUEDUCT_SLOPE,0xe5e5e5);
  gradedBlock(m,mid,0,length,1.6,.04,top+.10,AQUEDUCT_SLOPE,0xa9a9a9);
  for(let i=0;i<count;i++){
   const u=(i+.5)*span,y=channelHeight(u);
   masonryArch(m,u,span,2,4.4,span-1.25,y-.2,0,AQUEDUCT_SLOPE);
   // Exposed inspection sections are deliberate illustrative cutaways.
   if(i%6!==2)gradedBlock(m,u,0,span,2.35,.18,y+1,AQUEDUCT_SLOPE,0xf0f0f0);
  }
  // An urban castellum and a countryside settling/intake tank; schematic, not
  // an assertion of an excavated source. Gravity flows from the higher SE end.
  for(const [point,dist,w,d] of [[a,0,12,10],[b,length,8,6]]){
   const n={x:point[0],z:point[1],angle:0},water=channelHeight(dist)+.1;
   lbox(n,0,0,w,d,water-.3,0,0xe2e2e2);
   lbox(n,0,0,w-1,d-1,.1,water,0xa9a9a9);
   for(const side of [-1,1]){
    lbox(n,side*(w/2-.2),0,.4,d,1,water-.1,0xf1f1f1);
    lbox(n,0,side*(d/2-.2),w,.4,1,water-.1,0xf1f1f1);
   }
   if(dist===0)for(const u of [-3,0,3]){
    lbox(n,u,-d/2-.06,1.4,.12,2.2,water-3.3,0x777777);
    lbox(n,u,-d/2-1.2,1,2.4,.6,.1,0xbebebe);
   }
  }
  host.dataset.aqueductSpans=String(count);
 }
 // Irregular terrain outline with gentle hills around the imperial center.
 const country=createCountrysidePlan();
 const shape=new THREE.Shape();COUNTRY_BOUNDARY.forEach((p,i)=>i?shape.lineTo(...p):shape.moveTo(...p));shape.closePath();
 const ground=new THREE.ShapeGeometry(shape,1);ground.rotateX(-Math.PI/2); // shape Y maps to -Z, flip to align plan
 ground.scale(1,1,-1);add(ground,0,-1.25,0,0,0xeeeeee,false);
 // End the visible channel at the landscape edge instead of projecting a long
 // grey strip into the empty background outside the city model.
 const riverPath=roundRiver(COUNTRY_RIVER).filter(p=>inside(p,COUNTRY_BOUNDARY)),riverSections=ribbonSections(riverPath);
 // Continuous hill surface supports residential plots; monument podiums form terraces.
 const terrain=new THREE.PlaneGeometry(900,1220,225,305);terrain.rotateX(-Math.PI/2);terrain.translate(0,0,-140);
 const terrainPos=terrain.attributes.position;
 for(let i=0;i<terrainPos.count;i++){const p=[terrainPos.getX(i),terrainPos.getZ(i)];terrainPos.setY(i,riverTerrainHeight(pathDistance(p,riverPath),heightAt(...p)-.12));}
 const triangles=[],idx=terrain.index.array;
 for(let i=0;i<idx.length;i+=3){const ids=[idx[i],idx[i+1],idx[i+2]];if(ids.every(j=>inside([terrainPos.getX(j),terrainPos.getZ(j)],COUNTRY_BOUNDARY)))triangles.push(...ids);}
 terrain.setIndex(triangles);terrain.computeVertexNormals();geometries.add(terrain);scene.add(new THREE.Mesh(terrain,mat(0xeeeeee)));
 // Low sloping banks, not the modern high Tiber embankment walls.
 strip(riverSections,-RIVER_WIDTH/2,RIVER_WIDTH/2,()=>-.43,0xcacaca);
 for(const side of [-1,1]){
  strip(riverSections,side*8,side*9.1,(_p,d)=>-.46+(Math.abs(d)-8)*.22,0xd5d5d5);
  strip(riverSections,side*9.1,side*11,(_p,d)=>-.218+(Math.abs(d)-9.1)*.065,0xe3e3e3);
 }
 const plan=createCityPlan();roadNetwork(plan);
 for(const bridge of BRIDGES)stoneBridge(bridge);
 // Monument footprints and orientations are shared with residential exclusion.
 for(const m of LANDMARKS){
  const base=heightAt(m.x,m.z)+.18;
  const podiumTop=m.type==='baths'?bathLevels(base).podiumTop:base+.2;
  lbox(m,0,0,m.w,m.d,podiumTop,0,0xf3f3f3);
  if(m.type==='theatre'){drawTheatre(m,base,monumentHelpers);
  }else if(m.type==='arena'){drawColosseum(m,base,monumentHelpers);
  }else if(m.type==='circus'||m.type==='stadium'){
   const venue=venuePlan(m),length=venue.length,ww=venue.width;
   const c={...m,angle:venue.angle},radius=ww/2-1,curveCenter=length/2-1-radius;
   const tiers=5,step=m.type==='circus'?1.05:.85;
   // Long parallel stands, ONE semicircular end, and a straight/slightly oblique end.
   // Outer seats are higher, descending toward the open arena.
   for(let tier=0;tier<tiers;tier++){
    const outer=radius-tier*step,inner=outer-step,h=(tiers-tier)*.85;
    const left=-length/2+1;
    for(const side of [-1,1]){
     const end=left+venue.straightEndSkew*side*outer;
     lbox(c,(end+curveCenter)/2,side*(outer-step/2),curveCenter-end,step,h,base,0xf1f1f1);
    }
    const arc=new THREE.Shape();arc.absarc(curveCenter,0,outer,-Math.PI/2,Math.PI/2,false);
    arc.absarc(curveCenter,0,inner,Math.PI/2,-Math.PI/2,true);arc.closePath();
    const g=new THREE.ExtrudeGeometry(arc,{depth:h,bevelEnabled:false,curveSegments:32});g.rotateX(-Math.PI/2);
    add(g,c.x,base,c.z,c.angle,0xf1f1f1);
    // Oblique straight end: leave a central entrance, never a second curved end.
    if(!venue.startingGates)for(const side of [-1,1]){
     const v=side*(inner/2+1),p=local(c.x,c.z,c.angle,left+tier*step+venue.straightEndSkew*v,v);
     box(...p,step,Math.max(1,inner-2),h,base,c.angle+Math.atan(venue.straightEndSkew),0xf1f1f1);
    }
   }
   if(venue.spina){
    // Spina and turning posts belong only to the Circus Maximus, never the stadium.
    lbox(c,-2,0,length*.6,1.6,1.1,base,0xc8c8c8);
    if(venue.obelisk){
     lbox(c,-2,0,1.4,1.4,1,base+1.1,0xdddddd);
     const p=local(c.x,c.z,c.angle,-2,0);
     add(new THREE.CylinderGeometry(.29,.5,6.2,4),p[0],base+5.2,p[1],c.angle+Math.PI/4,0xe4e4e4);
     add(new THREE.ConeGeometry(.41,.8,4),p[0],base+8.7,p[1],c.angle+Math.PI/4,0xe4e4e4);
    }
    for(const u of [-length*.30-2,length*.30-2])for(let j=-1;j<=1;j++){
     const p=local(c.x,c.z,c.angle,u,j*.65);add(new THREE.ConeGeometry(.3,1.7,8),p[0],base+1.1,p[1],0,0xcccccc);
    }
   }
   if(venue.startingGates){
    // Twelve carceres at the NW end; not an athletics stadium's open track.
    for(let i=0;i<=venue.startingGates;i++){
     const v=-radius+i*radius*2/venue.startingGates,u=-length/2+1+v*venue.straightEndSkew;
     lbox(c,u,v,2,.38,3,base,0xe9e9e9);
     if(i<venue.startingGates)lbox(c,u,v+radius/venue.startingGates,2,radius*2/venue.startingGates,.4,base+3,0xf5f5f5);
    }
   }
   detailVenue(c,length,ww,base,monumentHelpers);
  }else if(m.type==='pantheon'){drawPantheon(m,base,monumentHelpers);
  }else if(m.type==='fountain'){drawTrevi(m,base,monumentHelpers);
  }else if(m.type==='forum'){drawForum(m,base,monumentHelpers);
  }else if(m.type==='temple'){drawTemple(m,base,monumentHelpers);
  }else if(m.type==='baths'){baths(m,base);detailBaths(m,bathLevels(base).floor,monumentHelpers);
  }else{drawPalace(m,base,monumentHelpers);}

 }
 // Dense but collision-free insulae and courtyard houses.
 for(const b of plan.buildings){
  const y=heightAt(b.x,b.z),m={...b};
  box(b.x,b.z,b.w+.24,b.d+.24,y+.12,0,b.angle,0xe5e5e5);
  if(b.style===4){
   // Domus / insula courtyard block: roofs face an actual open inner court.
   const wing=Math.min(b.w,b.d)*.25;
   for(const side of [-1,1]){
    const p=local(b.x,b.z,b.angle,0,side*(b.d-wing)/2),q=local(b.x,b.z,b.angle,side*(b.w-wing)/2,0);
    box(...p,b.w,wing,b.h,y,b.angle,0xf5f5f5);roof({...b,x:p[0],z:p[1]},b.w+.18,wing+.18,.65,y+b.h);
    box(...q,wing,b.d-2*wing,b.h,y,b.angle,0xf5f5f5);roof({...b,x:q[0],z:q[1],angle:b.angle+Math.PI/2},b.d-2*wing,wing+.18,.65,y+b.h);
   }
   lbox(b,0,0,b.w-2*wing,b.d-2*wing,.15,y+.13,0xd2d2d2);
   continue;
  }
  box(b.x,b.z,b.w,b.d,b.h,y,b.angle,0xfafafa);
  roof(m,b.w+.25,b.d+.25,.8,y+b.h);
  for(let yy=2;yy<b.h-.4;yy+=2){
   for(const side of [-1,1]){
    const p=local(b.x,b.z,b.angle,-b.w/2,side*b.d/2),q=local(b.x,b.z,b.angle,b.w/2,side*b.d/2);line([[p[0],y+yy,p[1]],[q[0],y+yy,q[1]]],true);
    for(let u=-b.w/2+.8;u<b.w/2-.3;u+=1.6){const p=local(b.x,b.z,b.angle,u,side*(b.d/2+.012));line([[p[0],y+yy+.3,p[1]],[p[0],y+yy+.95,p[1]]],true);}
   }
  }
 }
 // A sparse agricultural belt outside the walls, distinct from the dense city.
 function ruralTree(x,z,k=1){
  add(new THREE.CylinderGeometry(.09*k,.14*k,2.2*k,5),x,1.1*k,z,0,0xababab,false);
  const crown=new THREE.IcosahedronGeometry(1.1,1);crown.scale(k,k*.8,k);
  add(crown,x,2.65*k,z,0,0xc5c5c5,true);
 }
 for(const road of [...country.roads,...country.lanes]){
  const cross=ribbonSections(samplePolyline(road.points,1.5));strip(cross,-road.width/2,road.width/2,()=>.035,0xdcdcdc);
  for(const side of [-1,1])line(cross.map(s=>{const p=offsetPoint(s,side*road.width/2);return [p[0],.045,p[1]];}),true);
 }
 for(const field of country.fields){
  const corners=[[-field.w/2,-field.d/2],[field.w/2,-field.d/2],[field.w*.44,field.d/2],[-field.w*.46,field.d/2]];
  const shape=new THREE.Shape();corners.forEach((p,i)=>i?shape.lineTo(...p):shape.moveTo(...p));shape.closePath();
  const g=new THREE.ShapeGeometry(shape);g.rotateX(-Math.PI/2);g.scale(1,1,-1);
  add(g,field.x,-.025,field.z,field.angle,({grain:0xe0e0e0,furrows:0xd3d3d3,orchard:0xe6e6e6,vines:0xdcdcdc})[field.kind],false);
  line([...corners,corners[0]].map(p=>{const q=local(field.x,field.z,field.angle,...p);return [q[0],-.008,q[1]];}),true);
  // Furrow ends follow the tapered plot; no rectangular carpet across its borders.
  for(let v=-field.d/2+1.5;v<field.d/2-1;v+=field.kind==='orchard'?5:1.8){
   const t=(v+field.d/2)/field.d,left=-field.w/2+field.w*.04*t+1,right=field.w/2-field.w*.06*t-1;
   const a=local(field.x,field.z,field.angle,left,v),b=local(field.x,field.z,field.angle,right,v);
   if(field.kind==='orchard'){
    for(let u=left+1;u<right-1;u+=5){const p=local(field.x,field.z,field.angle,u,v);ruralTree(...p,.65);}
   }else{
    line([[a[0],.015,a[1]],[b[0],.015,b[1]]],true);
    for(let u=left+1;u<right;u+=field.kind==='vines'?4:2.8){
     const p=local(field.x,field.z,field.angle,u,v);
     if(field.kind==='vines'){
      line([[p[0],0,p[1]],[p[0],.9,p[1]]],true);
      const crown=new THREE.IcosahedronGeometry(.42,0);crown.scale(1,.6,1);add(crown,p[0],.72,p[1],0,0xbdbdbd,false);
     }else if(field.kind==='grain')line([[p[0]-.12,.08,p[1]],[p[0],.48,p[1]],[p[0]+.15,.16,p[1]]],true);
    }
   }
  }
 }
 for(const h of country.houses){
  lbox(h,0,0,h.w+.5,h.d+.5,.12,0,0xe2e2e2);lbox(h,0,0,h.w,h.d,h.h,.12,0xf2f2f2);
  roof(h,h.w+.5,h.d+.5,h.barn?1.7:1.2,h.h+.12);
  lbox(h,0,h.d/2+.03,.85,.08,1.5,.12,0xb3b3b3);
  for(const side of [-1,1])lbox(h,side*h.w*.29,h.d/2+.04,.65,.08,.65,1.3,0xc2c2c2);
  if(h.barn){for(const side of [-1,1])column(h,side*h.w*.35,-h.d/2-1.2,2.1,.1,.14);lbox(h,0,-h.d/2-.7,h.w,1.6,.2,2.2,0xe1e1e1);}
 }
 for(const tree of country.trees)ruralTree(tree.x,tree.z,tree.scale);
 host.dataset.ruralFields=String(country.fields.length);host.dataset.ruralHouses=String(country.houses.length);
 // Aurelian perimeter follows an irregular footprint. Gaps preserve road gates.
 const boundary=[...CITY_BOUNDARY,CITY_BOUNDARY[0]];
 for(let i=1;i<boundary.length;i++){
  const a=boundary[i-1],b=boundary[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]),angle=Math.atan2(b[0]-a[0],b[1]-a[1]);
  for(let dist=4;dist<len;dist+=3){const t=dist/len,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(country.gates.some(g=>Math.hypot(g.x-x,g.z-z)<5)||distanceRiver(x,z)<15||ROADS.some(r=>pathDistance([x,z],r.points)<r.width/2+3))continue;box(x,z,1.5,2.9,4,0,angle,0xe6e6e6);if(Math.floor(dist/3)%7===1)box(x,z,3.3,3.3,6,0,angle,0xdddddd);}
 }
 function distanceRiver(x,z){return pathDistance([x,z],RIVER);}
 // Arcade carries a covered, gently graded gravity channel from the south-east.
 romanAqueduct();
 const life=createLifePlan(plan);
 // Small public rooms in the city fabric, paved on the actual terrain.
 for(const p of plan.plazas){
  const mesh=new THREE.PlaneGeometry(p.w,p.d,Math.ceil(p.w),Math.ceil(p.d));mesh.rotateX(-Math.PI/2);
  const pos=mesh.attributes.position;
  for(let i=0;i<pos.count;i++){const [x,z]=plazaPoint(p,pos.getX(i),pos.getZ(i));pos.setXYZ(i,x,heightAt(x,z)+.095,z);}
  add(mesh,0,0,0,0,ROAD_COLOR,false);
 }
 // Grayscale turf gives the open ground a readable material instead of
 // blank white space. Small cells follow terrain and leave every road clear.
 for(const lawn of plan.lawns){
  const positions=[],cell=1;
  for(let u=-lawn.w/2;u<lawn.w/2;u+=cell)for(let v=-lawn.d/2;v<lawn.d/2;v+=cell){
   const p=plazaPoint(lawn,u+.5,v+.5);
   if(plan.streets.some(r=>pathDistance(p,r.points)<r.width/2+.9)||LANDMARKS.some(m=>landmarkContains(p,m,1.5))||PUBLIC_FIXTURES.some(f=>landmarkContains(p,f,1)))continue;
   for(const [du,dv] of [[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]]){const [x,z]=plazaPoint(lawn,u+du,v+dv);positions.push(x,heightAt(x,z)+.13,z);}
   if((Math.round(u*2)+Math.round(v*2))%6===0){const [x,z]=p;line([[x-.16,heightAt(x-.16,z)+.16,z],[x+.16,heightAt(x+.16,z+.2)+.16,z+.2]],true);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));add(g,0,0,0,0,0xd0d0d0,false);
 }
 host.dataset.lawns=String(plan.lawns.length);
 for(const f of PUBLIC_FIXTURES){
  const base=heightAt(f.x,f.z)+.15;
  if(f.kind==='bench'){
   lbox(f,0,0,f.w,f.d,.22,base+.55,0xd4d4d4);
   for(const v of [-.9,.9])lbox(f,0,v,.55,.35,.55,base,0xc1c1c1);
  }else if(f.kind==='fountain'){
   ellipseBand(f,1.5,1.5,.3,.6,base);
   add(new THREE.CylinderGeometry(1.17,1.17,.04,24),f.x,base+.3,f.z,0,0xaaaaaa,false);
   column(f,0,0,1.6,base,.16);
   add(new THREE.SphereGeometry(.28,8,6),f.x,base+1.7,f.z,0,0xeaeaea);
  }else{
   lbox(f,0,0,3.2,1.7,.7,base,0xd3d3d3);
   for(const u of [-1.55,1.55])for(const v of [-.9,.9])lbox(f,u,v,.10,.10,2.45,base,0x777777);
   for(let i=0;i<7;i++)lbox(f,-1.5+i*.5,0,.5,2.3,.10,base+2.45,i%2?0xe9e9e9:0xbebebe);
   for(const u of [-1,0,1]){const [x,z]=plazaPoint(f,u,0);add(new THREE.CylinderGeometry(.26,.2,.4,8),x,base+.92,z,0,0xa8a8a8);}
  }
 }
 host.dataset.plazas=String(plan.plazas.length);
 // Cypress, umbrella pines, olives and shrubs, in monochrome architectural tones.
 for(const p of life.plants){
  const {x,z,scale:k,y,kind}=p;
  if(kind==='shrub'){
   const g=new THREE.IcosahedronGeometry(.65,1);g.scale(k,k*.65,k);add(g,x,y+.36*k,z,p.angle,0xbdbdbd,false);continue;
  }
  const h=kind==='pine'?4.8:kind==='cypress'?5.4:3.4;
  add(new THREE.CylinderGeometry(.1*k,.16*k,h*k,5),x,y+h*k/2,z,0,0x999999,false);
  if(kind==='cypress'){
   const g=new THREE.SphereGeometry(1,8,7);g.scale(.82*k,2.4*k,.82*k);add(g,x,y+3.8*k,z,p.angle,0xb1b1b1,true);
  }else if(kind==='pine'){
   const g=new THREE.SphereGeometry(1,9,6);g.scale(1.8*k,.8*k,1.65*k);add(g,x,y+4.6*k,z,p.angle,0xc5c5c5,true);
   const h=new THREE.SphereGeometry(1,8,5);h.scale(1.35*k,.7*k,1.3*k);add(h,x,y+5.1*k,z,p.angle,0xcdcdcd,false);
  }else{
   for(let j=0;j<3;j++){
    const a=p.angle+j*Math.PI*2/3,g=new THREE.IcosahedronGeometry(.9*k,1);g.scale(1,.85,1);
    add(g,x+Math.cos(a)*.5*k,y+(2.8+j*.15)*k,z+Math.sin(a)*.5*k,a,0xc3c3c3,j===0);
   }
  }
 }
 for(const [color,pos] of batches){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();if(color===ROAD_COLOR){const uv=[];for(let i=0;i<pos.length;i+=3)uv.push(pos[i]/8,pos[i+2]/8);g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));}geometries.add(g);scene.add(new THREE.Mesh(g,mat(color)));}
 for(const [pos,material] of [[edgePositions,ink],[detailPositions,fineInk]]){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geometries.add(g);scene.add(new THREE.LineSegments(g,material));}
 batches.clear();edgePositions.length=0;detailPositions.length=0;
 const streamLengths=[0];for(let i=1;i<riverPath.length;i++)streamLengths.push(streamLengths[i-1]+Math.hypot(riverPath[i][0]-riverPath[i-1][0],riverPath[i][1]-riverPath[i-1][1]));
 const streamLength=streamLengths.at(-1),flowCount=110,flowPositions=new Float32Array(flowCount*6),flowGeometry=new THREE.BufferGeometry();
 flowGeometry.setAttribute('position',new THREE.BufferAttribute(flowPositions,3).setUsage(THREE.DynamicDrawUsage));geometries.add(flowGeometry);
 const flowMaterial=new THREE.LineBasicMaterial({color:0xf2f2f2,transparent:true,opacity:.26,depthWrite:false});
 const flowLines=new THREE.LineSegments(flowGeometry,flowMaterial);flowLines.frustumCulled=false;scene.add(flowLines);
 let flowTime=0;
 function streamPoint(distance,lateral){
  const d=((distance%streamLength)+streamLength)%streamLength;let lo=1,hi=streamLengths.length-1;
  while(lo<hi){const mid=(lo+hi)>>1;if(streamLengths[mid]<d)lo=mid+1;else hi=mid;}
  const a=riverPath[lo-1],b=riverPath[lo],length=streamLengths[lo]-streamLengths[lo-1],t=(d-streamLengths[lo-1])/length;
  return [a[0]+(b[0]-a[0])*t-(b[1]-a[1])/length*lateral,-.414,a[1]+(b[1]-a[1])*t+(b[0]-a[0])/length*lateral];
 }
 function updateRiver(dt){
  if(!paused)flowTime+=dt;
  for(let i=0;i<flowCount;i++){
   const d=(i*streamLength/flowCount+flowTime*(.45+(i%5)*.12))%streamLength,lateral=Math.sin(i*2.39)*6.6;
   flowPositions.set(streamPoint(d,lateral),i*6);flowPositions.set(streamPoint(Math.min(streamLength-1e-6,d+.7+(i%4)*.35),lateral),i*6+3);
  }
  flowGeometry.attributes.position.needsUpdate=true;
 }
 host.dataset.plants=String(life.plants.length);host.dataset.pedestrians=String(life.people.length);
 host.dataset.buildings=String(plan.buildings.length);host.dataset.landmarks=String(LANDMARKS.length);

 // Carts follow actual visible street polylines; return along the same street.
 const carts=[],hitObjects=[];const cube=new THREE.BoxGeometry(1,1,1);geometries.add(cube);
 function movingBox(group,w,h,d,x,y,z,color){const o=new THREE.Mesh(cube,mat(color));o.scale.set(w,h,d);o.position.set(x,y,z);group.add(o);return o;}
 ROADS.forEach((road,r)=>{
  const points=road.points.map(p=>new THREE.Vector3(p[0],0,p[1]));const lengths=[0];for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+points[i].distanceTo(points[i-1]));
  const cartCount=Math.max(1,Math.min(4,Math.ceil(lengths.at(-1)/100)));
  for(let j=0;j<cartCount;j++){
   const group=new THREE.Group();movingBox(group,1.5,.7,2,0,.85,0,0x222222);movingBox(group,.8,.65,1.6,0,.75,2.1,0x444444);movingBox(group,.45,.8,.5,0,1.15,2.9,0x222222);
   for(const x of [-.85,.85])for(const z of [-.6,.6])movingBox(group,.2,.7,.65,x,.5,z,0x111111);
   const v={group,road,points,lengths,length:lengths.at(-1),dist:lengths.at(-1)*j/cartCount,speed:3.1+(j%3)*.35,id:`R${r+1}-${j+1}`};
   group.traverse(o=>{o.userData.cart=v;if(o.isMesh)hitObjects.push(o);});scene.add(group);carts.push(v);
  }
 });
 // Instanced bodies and role accessories: population does not add per-person draw calls.
 const crowdBatches=[];
 function crowdMesh(geometry,count,color){
  geometries.add(geometry);const mesh=new THREE.InstancedMesh(geometry,mat(color),count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;
  scene.add(mesh);crowdBatches.push(mesh);return mesh;
 }
 const heads=crowdMesh(new THREE.SphereGeometry(.15,6,5),life.people.length,0x777777);
 const bodies=crowdMesh(new THREE.CylinderGeometry(.17,.25,.52,6),life.people.length,0xeeeeee);
 const limbs=crowdMesh(new THREE.BoxGeometry(1,1,1),life.people.length*4,0x666666);
 const roleCounts={soldier:0,noble:0,merchant:0,resident:0};
 life.people.forEach(p=>{p.roleIndex=roleCounts[p.role]++;});
 const helmets=crowdMesh(new THREE.SphereGeometry(.185,8,6),roleCounts.soldier,0xaaaaaa);
 const crests=crowdMesh(new THREE.BoxGeometry(1,1,1),roleCounts.soldier,0x444444);
 const shields=crowdMesh(new THREE.BoxGeometry(1,1,1),roleCounts.soldier,0x888888);
 const spears=crowdMesh(new THREE.BoxGeometry(1,1,1),roleCounts.soldier,0x555555);
 const robes=crowdMesh(new THREE.CylinderGeometry(.2,.36,.95,8),roleCounts.noble,0xf6f6f6);
 const sashes=crowdMesh(new THREE.BoxGeometry(1,1,1),roleCounts.noble,0x999999);
 const hats=crowdMesh(new THREE.ConeGeometry(.33,.18,8),roleCounts.merchant,0xb1b1b1);
 const baskets=crowdMesh(new THREE.CylinderGeometry(.18,.13,.32,8),roleCounts.merchant,0x888888);
 const walker=new THREE.Object3D(),part=new THREE.Object3D(),forwardAxis=new THREE.Vector3(1,0,0);
 const walkSample={},bodyTone=new THREE.Color();let crowdTime=0;
 life.people.forEach((p,i)=>{bodyTone.setScalar(.3+p.tone*.38);bodies.setColorAt(i,bodyTone);p.heading=sampleWalk(life.paths[p.path],p.start).angle;});
 function updateCrowd(dt){
  if(!paused)crowdTime+=dt;
  life.people.forEach((p,i)=>{
   const activity=personMotion(p,crowdTime);
   sampleWalk(life.paths[p.path],activity.distance,walkSample);
   if(!paused){const delta=Math.atan2(Math.sin(walkSample.angle-p.heading),Math.cos(walkSample.angle-p.heading));p.heading+=delta*(1-Math.exp(-dt*10));}
   const gait=activity.moving?Math.sin(crowdTime*p.speed*7+p.phase)*.52:0,k=p.scale;
   walker.position.set(walkSample.x,walkSample.y+(activity.moving?Math.abs(Math.sin(crowdTime*p.speed*7+p.phase))*.025:0),walkSample.z);
   walker.rotation.set(0,p.heading,0);walker.scale.setScalar(k);walker.updateMatrix();
   function pose(mesh,index,x,y,z,sx,sy,sz,angle=0){part.position.set(x,y,z);part.quaternion.setFromAxisAngle(forwardAxis,angle);part.scale.set(sx,sy,sz);part.updateMatrix();matrix.multiplyMatrices(walker.matrix,part.matrix);mesh.setMatrixAt(index,matrix);}
   pose(heads,i,0,1.29,0,1,1,1);pose(bodies,i,0,.86,0,1,1,1);
   // Opposite arms/legs swing around shoulder/hip pivots instead of sliding rigidly.
   for(const side of [-1,1]){
    const leg=gait*side,arm=activity.moving?-gait*side:Math.sin(crowdTime*1.5+p.phase)*.14,offset=side===-1?0:1;
    pose(limbs,i*4+offset,side*.095,.50-Math.cos(leg)*.25,-Math.sin(leg)*.25,.08,.50,.09,leg);
    pose(limbs,i*4+2+offset,side*.25,1.08-Math.cos(arm)*.19,-Math.sin(arm)*.19,.07,.38,.08,arm);
   }
   const j=p.roleIndex;
   if(p.role==='soldier'){
    pose(helmets,j,0,1.36,0,1,.8,1);pose(crests,j,0,1.55,0,.07,.19,.29);
    pose(shields,j,-.36,.82,.1,.09,.6,.38);pose(spears,j,.34,1.05,.12,.035,1.95,.035);
   }else if(p.role==='noble'){
    pose(robes,j,0,.65,0,1,1,1);pose(sashes,j,.1,.88,.21,.14,.51,.07,-.18);
   }else if(p.role==='merchant'){
    pose(hats,j,0,1.48,0,1,1,1);pose(baskets,j,.34,.67,.13,1,1,1);
   }
  });
  for(const mesh of crowdBatches)mesh.instanceMatrix.needsUpdate=true;
 }
 const ringGeometry=new THREE.RingGeometry(2.5,2.7,36);geometries.add(ringGeometry);const selectionRing=new THREE.Mesh(ringGeometry,mat(0x333333));selectionRing.rotation.x=-Math.PI/2;selectionRing.visible=false;scene.add(selectionRing);
 const card=document.getElementById('vehicle-card'),followButton=document.getElementById('vc-follow'),pauseButton=document.getElementById('scene-pause');
 const en=()=>document.documentElement.lang==='en';
 const set=(id,text)=>{const el=document.getElementById(id);if(el)el.textContent=text;};
 function syncUI(){
  set('scene-bearing',`${rotationDegrees(orbit.yaw)}°`);
  pauseButton.textContent=paused?(en()?'Play':'继续'):(en()?'Pause':'暂停');
  followButton.textContent=following?(en()?'Stop following':'停止跟随'):(en()?'Follow':'跟随');
  if(!selected)return;
  set('vc-kind',en()?'CART':'马车');set('vc-id',selected.id);set('vc-task',en()?'Travelling along the city streets':'沿城市街道行驶');set('vc-route',en()?selected.road.en:selected.road.zh);
  const p=selected.group.position;const nearest=[...LANDMARKS].sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0];
  set('vc-next',en()?nearest.en:nearest.zh);set('vc-sector',en()?'Imperial Rome':'古罗马城区');set('vc-speed',paused?'0 km/h':`${Math.round(selected.speed*2)} km/h`);
 }
 function deselect(){selected=null;following=false;card.hidden=true;selectionRing.visible=false;followButton.setAttribute('aria-pressed','false');syncUI();}
 on(document.getElementById('vc-close'),'click',deselect);
 on(followButton,'click',()=>{following=!following;followButton.setAttribute('aria-pressed',String(following));syncUI();});
 on(pauseButton,'click',()=>{paused=!paused;pauseButton.setAttribute('aria-pressed',String(paused));syncUI();});
 on(window,'rome-language-change',syncUI);
 
 const tabs=[...document.querySelectorAll('.town-districts button')];
 function focusRegion(index){deselect();tabs.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});
  const selectedTab=tabs[index],strip=selectedTab.parentElement;
  const tabRect=selectedTab.getBoundingClientRect(),stripRect=strip.getBoundingClientRect();
  if(tabRect.left<stripRect.left)strip.scrollLeft+=tabRect.left-stripRect.left;
  else if(tabRect.right>stripRect.right)strip.scrollLeft+=tabRect.right-stripRect.right;
  const id=selectedTab.dataset.landmark;
  orbitTarget=viewAngles(id);
  if(id==='all'){desired.set(10,0,-121);zoomTarget=.80;}else if(id==='civic'){desired.set(-23,0,-35);zoomTarget=2.5;}else if(id==='river'){desired.set(-130,0,10);zoomTarget=2.7;}else{const m=LANDMARKS.find(m=>m.id===id);desired.set(m.x,0,m.z);zoomTarget=id==='circus'?3.2:id==='pantheon'?6:id==='trevi'?6.5:m.type==='baths'?3.8:m.type==='theatre'?6.5:m.type==='temple'?6:4.8;}
 }
 tabs.forEach((button,i)=>{on(button,'click',()=>focusRegion(i));on(button,'keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[n].focus();focusRegion(n);}});});
 const rotateButton=document.getElementById('scene-rotate-mode');
 function stopFollowing(){following=false;followButton.setAttribute('aria-pressed','false');syncUI();}
 function rotateBy(angle){stopFollowing();orbitTarget.yaw=wrapAngle(orbitTarget.yaw+angle);}
 on(document.getElementById('scene-rotate-left'),'click',()=>rotateBy(-Math.PI/6));
 on(document.getElementById('scene-rotate-right'),'click',()=>rotateBy(Math.PI/6));
 on(rotateButton,'click',()=>{rotateMode=!rotateMode;rotateButton.setAttribute('aria-pressed',String(rotateMode));canvas.classList.toggle('rotate-mode',rotateMode);});
 on(document.getElementById('scene-view-reset'),'click',()=>focusRegion(Math.max(0,tabs.findIndex(b=>b.getAttribute('aria-selected')==='true'))));
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),pointers=new Map();let moved=0,pinch=0,twist=0,rotateGesture=false;
 on(canvas,'pointerdown',e=>{
  if(e.button!==0&&e.pointerType==='mouse')return;
  if(!pointers.size){moved=0;rotateGesture=rotateMode||e.shiftKey;}
  canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);stopFollowing();
  if(pointers.size===2){const [a,b]=[...pointers.values()];pinch=Math.hypot(a[0]-b[0],a[1]-b[1]);twist=Math.atan2(b[1]-a[1],b[0]-a[0]);moved=99;}
  canvas.classList.add('dragging');
 });
 on(canvas,'pointermove',e=>{
  const previous=pointers.get(e.pointerId);if(!previous)return;pointers.set(e.pointerId,[e.clientX,e.clientY]);
  if(pointers.size===2){
   const [a,b]=[...pointers.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]),angle=Math.atan2(b[1]-a[1],b[0]-a[0]);
   zoomTarget=THREE.MathUtils.clamp(zoomTarget*d/(pinch||d),.65,8);orbitTarget.yaw=wrapAngle(orbitTarget.yaw-wrapAngle(angle-twist));
   pinch=d;twist=angle;moved=99;return;
  }
  const dx=e.clientX-previous[0],dy=e.clientY-previous[1];moved+=Math.abs(dx)+Math.abs(dy);if(moved<4)return;
  if(rotateGesture||e.shiftKey){orbitTarget.yaw=wrapAngle(orbitTarget.yaw-dx*.008);return;}
  const scale=2*halfH/zoom/height,right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0),up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1);up.y=0;up.normalize();
  desired.addScaledVector(right,-dx*scale).addScaledVector(up,dy*scale);desired.x=THREE.MathUtils.clamp(desired.x,-445,445);desired.z=THREE.MathUtils.clamp(desired.z,-665,430);
 });
 function pointerEnd(e,cancel=false){
  if(!pointers.has(e.pointerId))return;
  pointers.delete(e.pointerId);if(!pointers.size)canvas.classList.remove('dragging');
  if(cancel||moved>4||rotateGesture||pointers.size)return;
  const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(hitObjects,false)[0];
  deselect();if(hit){selected=hit.object.userData.cart;card.hidden=false;selectionRing.visible=true;syncUI();}
 }
 on(canvas,'pointerup',e=>pointerEnd(e));on(canvas,'pointercancel',e=>pointerEnd(e,true));on(canvas,'lostpointercapture',e=>pointerEnd(e,true));
 on(canvas,'wheel',e=>{e.preventDefault();zoomTarget=THREE.MathUtils.clamp(zoomTarget*Math.exp(-e.deltaY*.001),.65,8);},{passive:false});
 on(canvas,'keydown',e=>{
  if(e.key==='Escape')deselect();if(e.key==='Home'){e.preventDefault();focusRegion(0);}
  if(e.key.toLowerCase()==='q'||e.key.toLowerCase()==='e'){e.preventDefault();rotateBy((e.key.toLowerCase()==='q'?-1:1)*Math.PI/6);}
  if(['+','=','-'].includes(e.key)){e.preventDefault();zoomTarget=THREE.MathUtils.clamp(zoomTarget*(e.key==='-'?.8:1.25),.65,8);}
 });
 function resize(){width=host.clientWidth;height=host.clientHeight;if(!width||!height)return;renderer.setSize(width,height,false);halfH=Math.max(210,355/(width/height));}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 let last=performance.now(),time=570,tick=0;
 function frame(now){if(disposed)return;const dt=Math.min((now-last)/1000,.05);last=now;
  for(const v of carts){if(!paused)v.dist+=dt*v.speed;let d=v.dist%(2*v.length),reverse=d>v.length;if(reverse)d=2*v.length-d;let index=1;while(index<v.lengths.length-1&&v.lengths[index]<d)index++;const a=v.points[index-1],b=v.points[index],t=(d-v.lengths[index-1])/(v.lengths[index]-v.lengths[index-1]);v.group.position.lerpVectors(a,b,t);v.group.position.y=streetHeight(v.group.position.x,v.group.position.z,BRIDGES,heightAt(v.group.position.x,v.group.position.z))+.08;v.group.rotation.y=Math.atan2(b.x-a.x,b.z-a.z)+(reverse?Math.PI:0);}
  updateCrowd(dt);updateRiver(dt);
  if(selected){selectionRing.position.copy(selected.group.position);selectionRing.position.y+=.12;if(following)desired.copy(selected.group.position);}
  orbit=advanceAngles(orbit,orbitTarget,dt,motionPreference.matches);direction.set(...orbitDirection(orbit));
  const easing=motionPreference.matches?1:1-Math.exp(-dt*7);target.lerp(desired,easing);zoom+=(zoomTarget-zoom)*easing;
  const hh=halfH/zoom;camera.left=-hh*width/height;camera.right=-camera.left;camera.top=hh;camera.bottom=-hh;camera.updateProjectionMatrix();camera.position.copy(target).addScaledVector(direction,1100);camera.lookAt(target);camera.updateMatrixWorld();
  if(!paused)time+=dt*2;tick+=dt;if(tick>.3){set('town-clock',`FIG 1 · ${String(Math.floor(time/60)%24).padStart(2,'0')}:${String(Math.floor(time)%60).padStart(2,'0')}`);syncUI();tick=0;}
  renderer.render(scene,camera);raf=requestAnimationFrame(frame);
 }
 document.getElementById('town-loading').hidden=true;focusRegion(0);raf=requestAnimationFrame(frame);
 // Return full cleanup so repeat mounts never leave canvases, listeners or GPU buffers.
 return ()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();abort.abort();for(const mesh of crowdBatches)mesh.dispose();for(const g of geometries)g.dispose();for(const m of materials.values())m.dispose();ink.dispose();fineInk.dispose();flowMaterial.dispose();pavingTexture.dispose();for(const texture of monumentTextures)texture.dispose();renderer.dispose();canvas.remove();};
}
