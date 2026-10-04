// Original pixel postcard. Landmarks are composed as a travel panorama, not a real map.
export const WIDTH = 960;
export const HEIGHT = 480;
const stops = ['宽窄巷子','天府广场','太古里','熊猫基地','望江楼','安顺廊桥'];
const englishStops = ['KUANZHAI ALLEY','TIANFU SQUARE','TAIKOO LI','PANDA BASE','WANGJIANG','ANSHUN BRIDGE'];
const clamp = n => Math.max(0, Math.min(1, n));
const rand = n => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
export function blend(a,b,t) {
 const parse=s=>{const m=s.match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/i);return m?[m[1],m[2],m[3]].map(Number):s.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16));};
 const ac=parse(a),bc=parse(b);
 return `rgb(${ac.map((v,i)=>Math.round(v+(bc[i]-v)*clamp(t))).join(',')})`;
}
export function nightAt(time,mode) { return mode==='day'?0:mode==='night'?1:clamp((Math.sin(time/90*Math.PI*2-Math.PI/2)+.15)/.9); }

export function renderStation(c,{time=0,night=0,english=false}={}) {
 const R=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
 const P=(points,col)=>{c.fillStyle=col;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();};
 const T=(str,x,y,size,col,align='left')=>{c.fillStyle=col;c.font=`${size}px monospace`;c.textAlign=align;c.textBaseline='middle';c.fillText(str,Math.round(x),Math.round(y));};
 const O=(x,y,r,col)=>{c.fillStyle=col;c.beginPath();c.arc(Math.round(x),Math.round(y),r,0,Math.PI*2);c.fill();};
 const roof=(x,y,w)=>{
  P([[x-6,y-5],[x+5,y],[x+14,y-9],[x+w-14,y-9],[x+w-5,y],[x+w+6,y-5],[x+w+2,y+5],[x-2,y+5]],'#314848');
  for(let i=4;i<w-3;i+=5) R(x+i,y-6,2,9,'#51615a');R(x-2,y+4,w+4,2,'#233a3d');
 };
 const window=(x,y,w=9,h=14)=>{R(x-1,y-1,w+2,h+2,'#544c3c');R(x,y,w,h,'#a5c5bd');R(x+w/2,y,1,h,'#4c5750');R(x,y+h/2,w,1,'#4c5750');};
 const tree=(x,y,s=1,flower=false)=>{
  R(x-2*s,y,4*s,16*s,'#725b42'); R(x+2*s,y+8*s,8*s,2*s,'#4c774e');
  O(x,y-6*s,12*s,flower?'#b88994':'#436f4f');O(x-6*s,y-8*s,10*s,flower?'#dea4a8':'#5a8f56');O(x+4*s,y-12*s,11*s,flower?'#efbcbc':'#6c9d5f');O(x-3*s,y-16*s,5*s,flower?'#f6d4c5':'#83b36b');
 };
 const panda=(x,y,scale=1)=>{
  c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale,scale);
  R(-6,0,12,11,'#eeead7');R(-7,7,4,5,'#273432');R(3,7,4,5,'#273432');R(-7,-6,4,4,'#273432');R(3,-6,4,4,'#273432');R(-6,-4,12,10,'#f7f2dd');R(-4,-1,3,4,'#273432');R(2,-1,3,4,'#273432');R(-1,3,2,1,'#273432');c.restore();
 };

 // Reusable streetscape details; a fixed seed keeps plantings stable during animation.
 const warmWindows=[];
 const shrub=(x,y,w=18)=>{
  R(x,y,w,5,'#466e4b');R(x+2,y-3,w-4,5,'#70925a');
  for(let i=3;i<w-2;i+=5)R(x+i,y-2,2,2,'#99b177');
 };
 const planter=(x,y,w=24,flowers=false)=>{
  R(x-1,y+3,w+2,4,'#ad946d');R(x,y+7,w,2,'#786f50');shrub(x,y,w);
  if(flowers)for(let i=3;i<w-2;i+=4){R(x+i,y-3,2,2,i%3?'#e7b7a3':'#ead08d');}
 };
 const shop=(x,y,w=30,h=24,tone='#bca788',sign='')=>{
  R(x,y,w,h,tone);R(x+w-4,y,4,h,'#8d8469');roof(x,y-2,w);
  R(x+3,y+9,w-6,h-10,'#47695f');
  for(let xx=x+5;xx<x+w-5;xx+=9){R(xx,y+11,6,8,'#adc3aa');warmWindows.push([xx,y+11,6,8]);}
  R(x+2,y+5,w-4,5,'#d9c496');
  if(sign)T(sign,x+w/2,y+7,4,'#605a40','center');
  R(x,y+h,w,2,'#dac49c');
 };
 const bench=(x,y)=>{R(x,y,15,2,'#ad8c5e');R(x,y+4,15,2,'#846d4e');R(x+2,y+6,2,3,'#4d654a');R(x+11,y+6,2,3,'#4d654a');};
 // Celestial cycle: one full day-night lap every 90 seconds, so the sun and
 // moon visibly rise and set. Forced day/night modes park the sun in place.
 const sunAng=time/90*Math.PI*2+.6;
 const sunEl=Math.sin(sunAng);
 night=clamp((.1-sunEl)/.72);
 const dayT=clamp(sunEl*1.8+.22),dusk=clamp(1-Math.abs(sunEl)*2.4);
 const top=blend(blend('#0c1830','#6ea6c9',dayT),'#5d6d9e',dusk);
 const hor=blend(blend('#233250','#f2e9c8',dayT),'#f6a05c',dusk);
 for(let y=0;y<190;y+=2) R(0,y,960,2,blend(top,hor,y/190));
 // The sun climbs over the eastern ridge and sinks behind the western one.
 const sunX=480-Math.cos(sunAng)*440,sunY=168-sunEl*132;
 if(sunEl>-.06){
  const glow=c.createRadialGradient(sunX,sunY,0,sunX,sunY,64);
  glow.addColorStop(0,`rgba(255,214,130,${.45+dusk*.45})`);glow.addColorStop(1,'rgba(255,180,90,0)');
  c.fillStyle=glow;c.fillRect(sunX-64,sunY-64,128,128);
  O(sunX,sunY,13,blend('#f6e8b1','#f29b3d',dusk));O(sunX,sunY,8,blend('#fff5d1','#ffd98a',dusk));
 }
 // The moon rides the opposite arc once daylight fades.
 const moonAng=sunAng+Math.PI,moonEl=-sunEl,moonX=480-Math.cos(moonAng)*430,moonY=162-moonEl*112;
 if(moonEl>-.02){
  const mglow=c.createRadialGradient(moonX,moonY,0,moonX,moonY,38);
  mglow.addColorStop(0,`rgba(214,222,205,${.2+night*.28})`);mglow.addColorStop(1,'rgba(214,222,205,0)');
  c.fillStyle=mglow;c.fillRect(moonX-38,moonY-38,76,76);
  c.beginPath();c.arc(moonX,moonY,9,0,Math.PI*2);c.arc(moonX+4,moonY-3,4.6,0,Math.PI*2);c.fill('evenodd');
 }
 // Clouds: four silhouette templates, varied sizes, and a brisk drift.
 const cloudCol=blend(blend('#26334e','#f1f0d9',dayT),'#efc39a',dusk*.55);
 const cloudShapes=[
  [[0,16],[14,8],[26,11],[38,0],[54,-6],[70,2],[84,6],[96,14],[120,18],[0,20]],
  [[0,10],[10,4],[22,6],[30,-2],[42,0],[50,8],[64,11],[0,13]],
  [[0,12],[18,10],[30,2],[44,4],[58,-4],[74,2],[86,10],[104,12],[104,16],[0,16]],
  [[0,14],[12,6],[20,8],[28,-6],[38,-8],[46,4],[56,0],[66,10],[80,14],[0,17]],
 ];
 for(let i=0;i<7;i++){
  const x=((i*197+time*(2.3+(i%3)*.55)+80)%1320)-190,y=24+(i%4)*22,sc=.75+(i%3)*.28;
  P(cloudShapes[i%4].map(([px,py])=>[x+px*sc,y+py*sc]),cloudCol);
 }
 // Distant mountains and the Chengdu skyline.
 P([[0,156],[60,135],[115,141],[172,111],[202,118],[246,141],[289,120],[354,142],[405,131],[468,151],[541,124],[607,134],[656,115],[725,143],[797,127],[850,139],[904,116],[960,137],[960,194],[0,194]],'#9bb7a0');
 P([[0,177],[89,161],[164,168],[239,144],[314,170],[404,150],[475,173],[545,148],[655,170],[727,144],[795,167],[885,145],[960,165],[960,224],[0,224]],'#7f9e83');
 for(let i=0;i<49;i++){const x=i*21,h=13+rand(i)*32;R(x,180-h,12+rand(i+3)*9,h,'#88a698');for(let yy=184-h;yy<177;yy+=5)R(x+3,yy,7,1,'#afc2aa');}
 // Two deeper city layers replace the uniformly low skyline.
 for(let i=0;i<20;i++){
  const x=12+i*49,w=20+Math.floor(rand(i+880)*15),h=36+Math.floor(rand(i+881)*62),y=183-h;
  R(x,y,w,h,i%3?'#86a79e':'#94b1a7');R(x+w-5,y,5,h,'#799990');
  R(x+4,y-4,w-8,4,'#9db9ac');
  for(let xx=x+4;xx<x+w-5;xx+=6)for(let yy=y+6;yy<177;yy+=8)R(xx,yy,3,3,'#bfd0b9');
  if(i%4===0){R(x+5,y+7,2,h-9,'#c4d1b9');R(x+w/2,y-12,1,8,'#6d938a');}
 }
 // A slender observation tower, and a recognisable stepped glass roofline.
 R(586,87,4,93,'#7a9d94');R(579,85,18,6,'#9ab4a3');R(582,79,12,6,'#769c93');R(587,66,2,13,'#73988b');
 P([[708,180],[708,105],[722,87],[739,105],[739,180]],'#7eaaa3');
 for(let x=712;x<737;x+=5)R(x,108,2,69,'#aac7b6');
 R(0,185,960,74,'#7f9d65');
 for(let i=0;i<700;i++)R(rand(i+70)*960,191+rand(i+85)*62,1+rand(i+99)*3,1,i%3?'#91ad72':'#678d58');
 // Infill lanes: tea houses, balconies and neighborhood shops behind the landmarks.
 for(const [x,y,w,h,tone] of [[5,159,30,26,'#b4aa8c'],[43,153,29,31,'#c7b591'],[80,160,27,25,'#ae9e83'],[115,158,28,27,'#c9b594'],[151,174,23,32,'#ac9c7e'],[272,157,28,28,'#b5b69b'],[359,159,31,28,'#c2ae8d'],[399,162,29,24,'#a9957f'],[433,173,23,30,'#bfaa8b'],[592,175,23,25,'#c2b192'],[696,170,30,29,'#bba385'],[730,163,25,25,'#c9b798'],[865,161,32,28,'#b7ac8f'],[908,164,33,29,'#bda58b']])shop(x,y,w,h,tone);
 for(const [x,y,z] of [[10,181,.62],[143,184,.66],[163,161,.67],[305,175,.78],[447,183,.58],[459,168,.64],[577,179,.88],[608,159,.6],[688,179,.73],[731,181,.55],[935,166,.79],[955,198,.82]])tree(x,y,z);
 // The riverfront is a connected promenade, rather than separate monuments on lawn.
 R(0,234,960,4,'#b5b486');
 for(const x of [146,301,442,585,702,927]){R(x,208,4,28,'#b9b68b');planter(x-6,229,17,true);}
 // Six deliberately recognizable landmark silhouettes, with detailed facades.
 for(let j=0;j<3;j++){
  const x=18+j*43,y=213+(j%2)*5;
  R(x,y-30,39,31,'#cab492');R(x+2,y-22,3,22,'#74604a');R(x+34,y-22,3,22,'#74604a');roof(x,y-30,39);
  window(x+8,y-20,9,12);R(x+23,y-19,9,20,'#575b48');R(x+25,y-15,5,2,'#d8b770');R(x-2,y-20,4,8,'#b74e3b');
 }
 R(13,219,139,3,'#b4ac87');
 // Tianfu Square: the museum's stepped mass and a statue in its public square.
 R(175,188,126,40,'#c2ba9f');R(180,184,116,5,'#ded4b7');
 for(let yy=191;yy<223;yy+=8)for(let xx=184;xx<292;xx+=13)R(xx,yy,9,3,'#648086');
 R(186,228,104,5,'#dfd6b6');R(230,215,15,15,'#d4cbb0');R(234,192,8,24,'#ece6ce');R(232,189,12,6,'#ece6ce');R(239,181,4,13,'#ece6ce');R(242,178,9,4,'#ece6ce');R(235,183,5,6,'#ece6ce');
 // Taikoo Li low-rise roofs.
 R(318,157,32,72,'#b3c0b1');R(321,160,26,60,'#819c9c');
 for(let yy=163;yy<215;yy+=6)R(323,yy,22,2,'#b5cac0');
  for(let j=0;j<2;j++){const x=355+j*38;R(x,199,34,29,'#ae7e65');roof(x,196,34);window(x+5,203,23,20);R(x+16,202,2,23,'#775649');}
 R(347,229,90,3,'#ddc5a3');
 // Bamboo grove and giant panda base.
 for(let j=0;j<14;j++){
  const x=463+j*8,y=172+rand(j)*14;R(x,y,2,58,'#426c48');
  for(let yy=y+6;yy<225;yy+=10){R(x,yy,3,1,'#a5b56d');P([[x,yy],[x-9,yy-5],[x-3,yy-5]],'#557f4d');P([[x+2,yy+2],[x+10,yy-3],[x+6,yy+3]],'#629350');}
 }
 R(467,223,109,12,'#a8bb7b');panda(493+Math.sin(time*.5)*2,218,1.3);panda(543,219,1);R(510,230,21,2,'#80965d');
 // Wangjiang Tower: four overhanging roofs, red columns, gold finial.
 R(647,152,6,17,'#c4a65b');
 for(let j=0;j<4;j++){const w=31+j*13,x=650-w/2,y=171+j*17;R(x+5,y,w-10,13,'#bb7454');for(let xx=x+9;xx<x+w-7;xx+=9)R(xx,y+2,4,8,'#ead4a3');roof(x,y-3,w);}
 R(610,237,81,4,'#b4b095');
 // Anshun covered bridge: arched stone piers and a Sichuan roof.
 R(744,218,176,8,'#c9b798');
 for(let j=0;j<5;j++){const x=750+j*34;R(x,223,8,15,'#a39e82');P([[x+8,226],[x+17,220],[x+25,226]],'#809e8b');}
 R(752,200,160,18,'#bd8757');for(let x=758;x<910;x+=14){R(x,202,7,12,'#526b65');R(x-2,200,2,18,'#9d6945');}
 roof(748,197,168);R(802,185,54,10,'#d6aa71');roof(798,183,62);
 // Small planted courtyards between attractions keep their entrances unobstructed.
 for(const [x,y,w] of [[24,224,32],[84,225,37],[180,235,28],[266,235,25],[358,236,24],[405,235,24],[472,238,27],[538,238,28],[616,243,20],[665,243,19],[773,240,24],[839,240,24],[894,240,24]])planter(x,y,w,true);
 for(const x of [152,308,449,591,705,937]){R(x,218,1,24,'#65775a');R(x-3,215,7,4,'#c5b780');}
 for(const x of [66,205,391,514,810])bench(x,234);
 // Footpaths and river shore across the scene.
 R(0,243,960,5,'#d4c193');R(0,251,960,51,'#60a7a7');
 for(let i=0;i<100;i++){const x=(rand(i+2)*980+time*(1+rand(i)))%980-20,y=256+rand(i+4)*41;R(x,y,3+rand(i+7)*13,1,i%4?'#88c6b9':'#b4d8c1');}
 for(let i=0;i<3;i++){const x=(time*(i%2?-2:3)+i*339+960)%1100-50,y=267+i*10;P([[x,y],[x+23,y],[x+19,y+5],[x+4,y+5]],'#746e52');R(x+9,y-8,1,8,'#6b694f');P([[x+10,y-8],[x+10,y-1],[x+19,y-1]],'#e4d4ad');}
 R(0,300,960,4,'#d4c69d');R(0,305,960,24,'#75915b');
 for(let x=0;x<960;x+=18){R(x,307,2,15,'#b7b398');R(x,308,18,2,'#ddd2b0');R(x,317,18,2,'#9fa28a');}
 // Near-bank garden walk, with small trees and flowering borders above the railway.
 for(let x=5;x<960;x+=42){shrub(x,306,25);if(x%3===0)planter(x+7,309,18,true);}
 for(const [x,z] of [[320,.57],[368,.66],[427,.53],[482,.67],[558,.53],[607,.6],[671,.55],[728,.65],[784,.52],[852,.56],[901,.54]])tree(x,304,z, x===427||x===728);
 for(const x of [346,513,756,872])bench(x,316);
 // Railway, ballast, sleepers. The train runs behind the platform and station.
 R(0,328,960,32,'#7f8275');
 for(let x=0;x<960;x+=10){R(x,334,4,20,'#685f4f');R(x,331,2,1,'#a7a693');}
 R(0,334,960,2,'#c6c4b0');R(0,353,960,2,'#c6c4b0');
 const trainX=((time*45+540)%1530)-520;
 for(let j=0;j<3;j++){
  const x=trainX+j*165,y=317;
  R(x+3,y,154,34,'#dbdac4');R(x+6,y-3,148,4,'#7e9488');R(x+3,y+23,154,11,'#367f78');R(x+3,y+33,154,3,'#3d524c');
  for(let k=0;k<6;k++){R(x+12+k*23,y+5,17,13,'#3d625f');R(x+14+k*23,y+6,13,8,'#99b9ac');R(x+19+k*23,y+5,1,13,'#506c60');}
  R(x+1,y+4,3,31,'#b6bca6');R(x+157,y+14,8,15,'#3d4944');
  for(const xx of [x+21,x+121]){R(xx,y+36,17,3,'#303d37');O(xx+3,y+39,3,'#27392f');O(xx+13,y+39,3,'#27392f');}
  T('TIANFU',x+69,y+28,5,'#d9ddba');
 }
 // Warm stone platform, bench, luggage and the station forecourt.
 R(0,361,960,58,'#c5a275');R(0,359,960,4,'#e3cba0');
 for(let yy=368;yy<415;yy+=10){R(0,yy,960,1,'#aa8d69');for(let xx=(yy%20)*3;xx<960;xx+=31)R(xx,yy-9,1,9,'#b7966f');}
 for(let xx=0;xx<960;xx+=8)R(xx,364,4,1,'#edcc80');
 // Tianfu station, interpreted through its broad, layered eaves and glass concourse.
 R(36,332,228,47,'#b59d7c');R(44,335,209,40,'#739a96');
 for(let x=48;x<250;x+=14){R(x,335,2,40,'#d0c6ad');R(x,346,12,1,'#4c6d68');R(x,359,12,1,'#4c6d68');}
 R(134,349,28,28,'#376563');R(148,350,1,27,'#c9c7ac');R(34,376,233,4,'#ddc9a2');
 P([[20,303],[80,310],[144,307],[201,310],[279,303],[270,316],[202,323],[91,323],[30,316]],'#d4c8ac');
 P([[30,317],[94,322],[202,322],[270,317],[265,328],[203,334],[92,334],[35,328]],'#56736b');
 for(let x=46;x<265;x+=9)R(x,320,1,7,'#94a592');
 R(38,331,225,6,'#e3d7b8');T(english?'CHENGDU TIANFU':'成 都 天 府 站',149,334,9,'#395854','center');
 R(44,338,4,39,'#cfc2a4');R(247,338,4,39,'#cfc2a4');
 // Travel sign, shelters, benches and tea cart.
 R(386,348,111,20,'#e5dfbc');R(389,350,105,16,'#315e59');T(english?'TIANFU · CHENGDU':'天府 · 成都',441,358,9,'#f0e5bb','center');R(393,369,3,22,'#5d6550');R(487,369,3,22,'#5d6550');
 R(572,349,112,5,'#41645c');R(577,354,2,30,'#7b7b5a');R(677,354,2,30,'#7b7b5a');
 for(const x of [566,740]){R(x,383,39,3,'#736b4c');R(x,375,39,6,'#9b8056');R(x+3,386,3,7,'#536447');R(x+33,386,3,7,'#536447');}
 R(839,379,38,18,'#c99c64');R(837,373,43,7,'#e4d2a7');R(845,355,2,19,'#6b7655');P([[830,358],[856,350],[884,358]],'#b85643');O(845,400,3,'#3b5242');O(872,400,3,'#3b5242');T('茶',854,388,9,'#6b543c','center');
 // Trees are planted to the sides of the station, leaving the doors clear.
 tree(10,351,1.5);tree(296,350,1.3);tree(937,351,1.8);tree(708,357,1.1,true);
 // Kiosks and planted waiting areas sit at the back edge of the forecourt.
 shop(327,367,40,17,'#bba078',english?'BOOKS':'书报');
 shop(716,366,29,18,'#c7b795',english?'COFFEE':'咖啡');
 for(const [x,w] of [[274,23],[505,19],[619,33],[769,20],[888,21]])planter(x,384,w,true);
 R(574,354,104,2,'#7a9769');for(let x=576;x<680;x+=12)shrub(x,349,12);
 // Tourists actually cross the platform, with alternating footfalls and little shadows.
 for(let i=0;i<23;i++){
  const speed=i%3===0?3:1.6,dir=i%2?1:-1;
  const x=((i*51+time*speed*dir+1200)%1000)-20,y=389+(i%3)*9,step=Math.sin(time*7+i)*2;
  R(x-2,y+14,11,2,'#ad946d');R(x,y,7,9,['#6e9b88','#b76552','#d4b668','#7b91ae','#b790a3'][i%5]);R(x+1,y-5,5,5,'#dfb48a');R(x+1,y-6,5,2,i%4?'#4b5040':'#d3cfb0');R(x+1+step/2,y+9,2,5,'#4c6058');R(x+4-step/2,y+9,2,5,'#4c6058');R(x-2,y+2,2,6,'#d6ad85');R(x+7,y+2,2,5,'#d6ad85');
  if(i%5===0){R(x-5,y+7,4,7,'#8c6650');R(x-4,y+4,1,3,'#70684e');}
 }
 // Meadow foreground with small flowers and a subtle station number.
 R(0,420,960,60,'#63864e');R(0,418,960,3,'#456749');
 for(let i=0;i<1300;i++){
  const x=rand(i+3)*960,y=424+rand(i+90)*54;
  R(x,y,1,2+rand(i+8)*3,i%3?'#769a55':'#91a965');
  if(i%17===0){R(x-1,y-1,3,2,i%2?'#d6cb8b':'#c6a095');}
 }
 // A foreground pocket park: winding path, planted beds, tea pavilion and bamboo.
 P([[0,442],[128,442],[156,430],[280,430],[325,444],[479,444],[527,431],[665,431],[714,445],[837,445],[882,433],[960,433],[960,442],[886,442],[840,454],[710,454],[661,440],[531,440],[482,453],[322,453],[276,439],[159,439],[130,451],[0,451]],'#b9b38a');
 for(const [x,y,w] of [[18,427,43],[93,460,39],[237,458,49],[344,425,46],[461,462,33],[561,451,50],[719,463,43],[818,425,29],[889,458,39]])planter(x,y,w,true);
 for(const [x,y,z,flower] of [[24,454,.88,false],[74,463,1.1,false],[186,464,1.04,true],[309,467,.8,false],[390,459,1.04,false],[443,471,.96,true],[557,476,.8,false],[679,463,1.04,false],[777,476,1.08,false],[930,468,1.04,true]])tree(x,y,z,flower);
 // Open tea pavilion: four posts and a light roof, leaving the path visible behind it.
 for(const x of [595,630])R(x,430,3,29,'#89764f');
 roof(589,427,50);R(596,452,34,3,'#a5895c');R(612,442,5,12,'#72654a');R(604,441,22,3,'#bba275');
 for(const [x,y] of [[134,464],[508,466],[844,465]])bench(x,y);
 for(let j=0;j<9;j++){const x=877+j*4,y=449-(j%3)*5;R(x,y,1,29,'#3d6c47');for(let yy=y+4;yy<474;yy+=7){R(x,yy,2,1,'#aabc7d');P([[x,yy],[x-5,yy-4],[x-2,yy-4]],'#89a362');}}
 // Slow butterflies make the park feel alive without obscuring the train or visitors.
 for(let i=0;i<5;i++){const x=110+i*171+Math.sin(time*.45+i)*13,y=433+Math.cos(time*.7+i)*5;R(x,y,1,3,'#7e684b');R(x-3,y-1,2,2,i%2?'#e4b6a5':'#e4cf86');R(x+1,y-1,2,2,i%2?'#e4b6a5':'#e4cf86');}
 // A brief warm grade at sunrise and sunset, then the world-wide night grade.
 if(dusk>.02){c.globalAlpha=dusk*.15;R(0,0,960,480,'#f4a24f');c.globalAlpha=1;}
 c.globalAlpha=night*.74;R(0,0,960,480,'#0b1636');c.globalAlpha=1;
 if(night>.05){
  c.globalAlpha=night;
  for(let i=0;i<62;i++){const x=rand(i+520)*960,y=8+rand(i+440)*105;R(x,y,1,1,blend('#8f99b6','#e9e3cc',(Math.sin(time*.9+i)+1)/2));}
  for(const [x,y,w,h] of warmWindows)R(x,y,w,h,'#c6ae78');
  // warm lights in glass, train and pavilion
  for(let x=51;x<245;x+=14)R(x,340,9,11,'#c9af72');
  for(let j=0;j<3;j++)for(let k=0;k<6;k++)R(trainX+j*165+14+k*23,323,13,8,'#d7bd83');
  for(let j=0;j<5;j++)R(758+j*28,204,7,9,'#d8a862');
  c.globalAlpha=1;
 }
 // Platform lamps stay over all layers and cast pools of light after dark.
 for(const x of [318,532,796,912]){
  R(x,342,3,43,'#3a5148');R(x-4,340,11,3,'#394f46');
  if(night>.05){c.globalAlpha=night*.62;const glow=c.createRadialGradient(x+1,347,0,x+1,365,36);glow.addColorStop(0,'rgba(255,221,144,.7)');glow.addColorStop(1,'rgba(255,221,144,0)');c.fillStyle=glow;c.fillRect(x-40,324,82,82);c.globalAlpha=1;}
  R(x-2,343,7,5,night>.3?'#ffe8b0':'#e3d8b1');
 }
 // Quiet labels, kept clear of buildings.
 for(let i=0;i<6;i++){
  const x=[82,238,381,523,650,835][i];const words=english?englishStops[i]:stops[i];
  c.font='8px monospace';const w=c.measureText(words).width+14;
  c.globalAlpha=.82;R(x-w/2,119,w,15,night>.4?'#243b45':'#e8e3cd');c.globalAlpha=1;
  T(words,x,126,8,night>.4?'#e4dfc3':'#36594c','center');
 }
 T('TIANFU / 01',22,460,7,night>.4?'#9bac99':'#d7dfbb');
 T('CHENGDU · 30°N 104°E',938,460,7,night>.4?'#9bac99':'#d7dfbb','right');
}

export async function mountTown(host,{onReady=()=>{},onError=()=>{}}={}) {
 const abort=new AbortController(),opts={signal:abort.signal};let raf=0,destroyed=false;
 try{
  const canvas=document.createElement('canvas');canvas.width=WIDTH;canvas.height=HEIGHT;canvas.setAttribute('role','img');host.replaceChildren(canvas);
  const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Canvas unavailable');ctx.imageSmoothingEnabled=false;
  const pause=document.getElementById('scene-pause');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduced.matches,time=0,previous=performance.now(),visible=true;
  const english=()=>document.documentElement.lang.startsWith('en');
  const paint=()=>renderStation(ctx,{time,night:nightAt(time,'auto'),english:english()});
  const sync=()=>{
   pause.textContent=paused?(english()?'Play':'继续播放'):(english()?'Pause':'暂停');pause.setAttribute('aria-pressed',String(paused));
   canvas.setAttribute('aria-label',english()?'Chengdu Tianfu Station: animated train, visitors and six Chengdu landmarks.':'成都天府站：列车、游客和六个成都景点的动态像素长景');
  };
  const tick=now=>{raf=0;if(destroyed)return;const dt=Math.min((now-previous)/1000,.1);previous=now;if(!paused&&!document.hidden&&visible)time+=dt;paint();if(!paused&&!document.hidden&&visible)raf=requestAnimationFrame(tick);};
  const resume=()=>{previous=performance.now();if(raf)cancelAnimationFrame(raf);raf=0;paint();if(!paused&&!document.hidden&&visible)raf=requestAnimationFrame(tick);};
  pause.addEventListener('click',()=>{paused=!paused;sync();resume();},opts);
  document.addEventListener('visibilitychange',resume,opts);
  reduced.addEventListener('change',event=>{paused=event.matches;sync();resume();},opts);
  const language=new MutationObserver(()=>{sync();paint();});language.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume();});observer.observe(host);
  sync();paint();onReady();resume();
  return {destroy(){destroyed=true;abort.abort();cancelAnimationFrame(raf);observer.disconnect();language.disconnect();canvas.remove();}};
 }catch(e){abort.abort();cancelAnimationFrame(raf);onError(e);throw e;}
}
