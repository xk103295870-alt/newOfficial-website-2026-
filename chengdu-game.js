// Original pixel postcard. Landmarks are composed as a travel panorama, not a real map.
export const WIDTH = 960;
export const HEIGHT = 480;
const stops = ['宽窄巷子','天府广场','太古里','熊猫基地','望江楼','安顺廊桥'];
const englishStops = ['KUANZHAI ALLEY','TIANFU SQUARE','TAIKOO LI','PANDA BASE','WANGJIANG','ANSHUN BRIDGE'];
const clamp = n => Math.max(0, Math.min(1, n));
const rand = n => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
export function blend(a,b,t) {
 const ac=a.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16)),bc=b.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16));
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
 // Atmosphere and moving clouds.
 for(let y=0;y<190;y+=2) R(0,y,960,2,blend('#8cbfce','#f1e9c6',y/190));
 O(746,49,16,'#f6e8b1');O(746,49,10,'#fff5d1');
 for(let i=0;i<4;i++){
  const x=((i*271+time*(1.1+i*.2)+80)%1180)-160,y=38+(i%2)*35;
  P([[x,y+14],[x+15,y+7],[x+27,y+9],[x+41,y-5],[x+52,y-10],[x+69,y+5],[x+84,y+8],[x+96,y+15],[x+130,y+19],[x,y+21]],'#f1f0d9');
  R(x+30,y+18,76,3,'#d2ddcc');
 }
 // Distant mountains and the Chengdu skyline.
 P([[0,156],[60,135],[115,141],[172,111],[202,118],[246,141],[289,120],[354,142],[405,131],[468,151],[541,124],[607,134],[656,115],[725,143],[797,127],[850,139],[904,116],[960,137],[960,194],[0,194]],'#9bb7a0');
 P([[0,177],[89,161],[164,168],[239,144],[314,170],[404,150],[475,173],[545,148],[655,170],[727,144],[795,167],[885,145],[960,165],[960,224],[0,224]],'#7f9e83');
 for(let i=0;i<49;i++){const x=i*21,h=13+rand(i)*32;R(x,180-h,12+rand(i+3)*9,h,'#88a698');for(let yy=184-h;yy<177;yy+=5)R(x+3,yy,7,1,'#afc2aa');}
 R(0,185,960,74,'#7f9d65');
 for(let i=0;i<700;i++)R(rand(i+70)*960,191+rand(i+85)*62,1+rand(i+99)*3,1,i%3?'#91ad72':'#678d58');
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
 // Taikoo Li low-rise roofs and the climbing IFS panda.
 R(318,157,32,72,'#b3c0b1');R(321,160,26,60,'#819c9c');
 for(let yy=163;yy<215;yy+=6)R(323,yy,22,2,'#b5cac0');
 panda(332,181,1.7);
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
 // Footpaths and river shore across the scene.
 R(0,243,960,5,'#d4c193');R(0,251,960,51,'#60a7a7');
 for(let i=0;i<100;i++){const x=(rand(i+2)*980+time*(1+rand(i)))%980-20,y=256+rand(i+4)*41;R(x,y,3+rand(i+7)*13,1,i%4?'#88c6b9':'#b4d8c1');}
 for(let i=0;i<3;i++){const x=(time*(i%2?-2:3)+i*339+960)%1100-50,y=267+i*10;P([[x,y],[x+23,y],[x+19,y+5],[x+4,y+5]],'#746e52');R(x+9,y-8,1,8,'#6b694f');P([[x+10,y-8],[x+10,y-1],[x+19,y-1]],'#e4d4ad');}
 R(0,300,960,4,'#d4c69d');R(0,305,960,24,'#75915b');
 for(let x=0;x<960;x+=18){R(x,307,2,15,'#b7b398');R(x,308,18,2,'#ddd2b0');R(x,317,18,2,'#9fa28a');}
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
 // One world-wide grade makes every building, person and tree participate in night.
 c.globalAlpha=night*.74;R(0,0,960,480,'#0b1636');c.globalAlpha=1;
 if(night>.05){
  c.globalAlpha=night;
  for(let i=0;i<62;i++){const x=rand(i+520)*960,y=8+rand(i+440)*105;R(x,y,1,1,blend('#8f99b6','#e9e3cc',(Math.sin(time*.9+i)+1)/2));}
  O(791,46,10,'#d6dccd');O(796,41,10,'#17243e');
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
  const buttons=[...document.querySelectorAll('[data-scene-control]:not(#scene-pause)')],pause=document.getElementById('scene-pause');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let mode='auto',paused=reduced.matches,time=0,previous=performance.now(),visible=true;
  const english=()=>document.documentElement.lang.startsWith('en');
  const paint=()=>renderStation(ctx,{time,night:nightAt(time,mode),english:english()});
  const sync=()=>{
   buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sceneControl===mode)));
   pause.textContent=paused?(english()?'Play':'继续播放'):(english()?'Pause':'暂停');pause.setAttribute('aria-pressed',String(paused));
   canvas.setAttribute('aria-label',english()?'Chengdu Tianfu Station: animated train, visitors and six Chengdu landmarks.':'成都天府站：列车、游客和六个成都景点的动态像素长景');
  };
  const tick=now=>{raf=0;if(destroyed)return;const dt=Math.min((now-previous)/1000,.1);previous=now;if(!paused&&!document.hidden&&visible)time+=dt;paint();if(!paused&&!document.hidden&&visible)raf=requestAnimationFrame(tick);};
  const resume=()=>{previous=performance.now();if(raf)cancelAnimationFrame(raf);raf=0;paint();if(!paused&&!document.hidden&&visible)raf=requestAnimationFrame(tick);};
  buttons.forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.sceneControl;sync();paint();},opts));
  pause.addEventListener('click',()=>{paused=!paused;sync();resume();},opts);
  document.addEventListener('visibilitychange',resume,opts);
  reduced.addEventListener('change',event=>{paused=event.matches;sync();resume();},opts);
  const language=new MutationObserver(()=>{sync();paint();});language.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume();});observer.observe(host);
  sync();paint();onReady();resume();
  return {destroy(){destroyed=true;abort.abort();cancelAnimationFrame(raf);observer.disconnect();language.disconnect();canvas.remove();}};
 }catch(e){abort.abort();cancelAnimationFrame(raf);onError(e);throw e;}
}
