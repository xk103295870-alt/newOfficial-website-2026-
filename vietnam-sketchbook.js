import { foldGeometry } from './sketchbook-fold.js?v=097b401088';

// The cover is original AI artwork; each interior spread has its own source photograph.
const canvas = document.getElementById('sketchbook');
const ctx = canvas.getContext('2d');
const prev = document.getElementById('sketch-prev');
const next = document.getElementById('sketch-next');
const counter = document.getElementById('sketch-pagination');
const caption = document.getElementById('sketch-caption');
const loading = document.getElementById('sketch-loading');
const dialog = document.getElementById('sketch-photo-dialog');
const photoButton = document.getElementById('sketch-photo-open');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const W=1200, H=720, HALF=W/2;
const pages=[
  {kind:'cover', caption:['一段旅程，从这里翻开。','A journey, one page at a time.']},
  {kind:'scene', asset:'river-01', original:'assets/越南旅拍1.jpeg', caption:['灯火点亮河面，蓝调时刻慢慢流过。','Lanterns on the river, a little moment in blue.'], alt:['蓝调时分的越南河景，两岸灯火与灯笼船','Vietnam river at blue hour, with lantern boats and lit buildings on both banks']},
  {kind:'scene', asset:'hoi-an-02', original:'assets/会安2.jpeg', caption:['走进会安的黄墙灯影，把街巷的热闹留在纸上。','Golden walls, lantern light, and a lively evening in Hội An.'], alt:['会安古城街巷，暖黄色店铺、彩色长裙、绿荫与往来行人','Hội An old-town street with golden shopfronts, colorful dresses, green foliage and passing pedestrians']},
  {kind:'scene', asset:'fireworks-03', original:'assets/烟花.jpeg', caption:['烟花越过城市的灯火，落进这一晚的记忆。','Fireworks above the city lights, a night to keep.'], alt:['屋顶泳池前的城市夜景，金色烟花在高楼后绽放','A rooftop pool overlooking the city at night, with golden fireworks behind a tall tower']},
  {kind:'scene', asset:'da-nang-04', original:'assets/岘港1.jpeg', caption:['岘港的晚风里，棕榈与粉紫色云霞并肩。','Palms and rose-lilac clouds in the evening breeze of Da Nang.'], alt:['岘港黄昏的滨河街道，棕榈树、粉紫云霞、亮灯拱桥与来往车辆','Da Nang riverside boulevard at dusk, with palms, rose-lilac clouds, an illuminated arched bridge and traffic']},
  {kind:'scene', asset:'train-street-05', original:'assets/越南封面.jpeg', photoSize:[1350,1800], thumbSize:[360,480], caption:['沿着铁轨慢慢走，咖啡香与街巷的灯火作伴。','A slow walk along the rails, with café lights along the way.'], alt:['越南铁道咖啡街，铁轨两侧的桌椅、彩灯、遮阳篷与行人','A Vietnamese railway café alley with tables, colorful lights, awnings and pedestrians beside the tracks']},
  {kind:'scene', asset:'fishing-06', original:'assets/钓鱼.jpeg', caption:['把时间交给河风，等一场安静的日落。','Let the river breeze slow the hours, waiting quietly for dusk.'], alt:['蓝调时分的河畔，男子倚着白色栏杆垂钓，旁边放着黄色钓箱，对岸是城市天际线','A man fishing beside a white riverside railing at blue hour, with a yellow tackle cooler and the city skyline across the water']},
  {"kind": "scene", "asset": "beach-sun-07", "original": "assets/海滩阳光.jpeg", "photoSize": [1800, 1200], "thumbSize": [480, 320], "caption": ["阳光落在海面，把浪尖染成金色。", "Sunlight turns the waves to gold."], "alt": ["金色阳光下的海滩、层叠海浪、云层与远山", "Golden sunlight over a beach, rolling waves, clouds and distant mountains"]},
  {"kind": "scene", "asset": "beach-palms-08", "original": "assets/岘港海边1.jpeg", "photoSize": [1800, 1350], "thumbSize": [480, 360], "caption": ["穿过椰林，就是海。", "Beyond the palms, the sea."], "alt": ["岘港海边入口，椰树、绿色岗亭、白色汽车与远处海面", "Da Nang beach entrance with palms, a green kiosk, a white car and the sea beyond"]},
  {"kind": "scene", "asset": "beach-crowd-09", "original": "assets/岘港海滩2.jpeg", "photoSize": [1800, 1350], "thumbSize": [480, 360], "caption": ["沙滩上的脚印，写着同一个傍晚。", "Footprints sharing the same evening on the sand."], "alt": ["阴云下的开阔海滩、游人、沙地脚印与远处山脉", "A broad beach under cloudy skies, with visitors, footprints and distant mountains"]},
  {"kind": "scene", "asset": "beach-evening-10", "original": "assets/岘港海边3.jpeg", "photoSize": [1800, 1350], "thumbSize": [480, 360], "caption": ["椰影与车灯，把海边的傍晚慢慢点亮。", "Palms and passing lights at the seaside dusk."], "alt": ["蓝调傍晚的海滨公路、椰树、人群与街边灯火", "A coastal road at blue hour, with palms, pedestrians and roadside lights"]},
  {"kind": "scene", "asset": "cafe-11", "original": "assets/咖啡厅.jpeg", "photoSize": [1800, 1350], "thumbSize": [480, 360], "caption": ["拱窗留住光，也留住一段咖啡时光。", "Arched windows, soft light, a pause for coffee."], "alt": ["从楼上俯瞰咖啡厅，红框拱窗、砖墙、长吧台与客人", "A café viewed from above, with red-framed arched windows, brick walls, a long counter and guests"]},
  {"kind": "scene", "asset": "street-noodles-12", "original": "assets/街边越南粉.jpeg", "photoSize": [1800, 1350], "thumbSize": [480, 360], "caption": ["街边的一碗热汤，是旅途里最日常的温暖。", "A warm bowl by the roadside, an everyday travel memory."], "alt": ["树下的街边粉摊，戴斗笠的摊主、食材篮子、小凳上的食客与摩托车", "A roadside noodle stall under a tree, with a conical-hatted vendor, ingredient baskets, seated diners and scooters"]},
  {"kind": "scene", "asset": "son-tra-13", "original": "assets/山茶半岛观音.jpeg", "photoSize": [1350, 1800], "thumbSize": [360, 480], "caption": ["山茶半岛上，白色观音静立云间。", "On Sơn Trà, the white Guanyin stands beneath the clouds."], "alt": ["山茶半岛白色观音像、莲花基座、寺院广场与游客", "The white Guanyin statue on Sơn Trà, its lotus pedestal, temple courtyard and visitors"]},
  {"kind": "scene", "asset": "vietnam-meal-14", "original": "assets/越南菜.jpeg", "photoSize": [1800, 1350], "thumbSize": [480, 360], "caption": ["围坐一张小桌，把越南的味道慢慢尝遍。", "Around a small table, tasting Vietnam one dish at a time."], "alt": ["蓝色塑料椅旁的越南餐桌，金属锅、米粉、食材拼盘与蘸料", "A Vietnamese meal beside blue plastic chairs, with a metal pot, noodles, ingredient platter and dipping sauces"]},
  {"kind": "scene", "asset": "hoi-an-rice-15", "original": "assets/会安鸡肉饭.jpeg", "photoSize": [1800, 1350], "thumbSize": [480, 360], "caption": ["一盘会安鸡肉饭，记住这座城的另一种颜色。", "Hội An chicken rice, another color of the journey."], "alt": ["黑色纹理桌面上的会安鸡肉饭、鸡肉拼盘、凉拌菜与清汤", "Hội An chicken rice on a dark patterned table, with chicken, salad and clear soup"]},
  {"kind": "scene", "asset": "hanoi-fish-16", "original": "assets/河内鱼饼.jpeg", "photoSize": [1706, 1279], "thumbSize": [480, 360], "caption": ["鱼香与莳萝，在河内的餐桌上相遇。", "Fish and dill meet at a Hanoi table."], "alt": ["木桌上的河内鱼料理，圆锅里的金黄鱼块与香草，四周米粉、花生和蘸料", "A Hanoi fish meal on a wooden table, with golden fish and herbs in a round pan, noodles, peanuts and sauces"]},
];
const artworks = new Map(pages.filter(page=>page.kind==='scene').map(page=>[page.asset,new Image()]));
const coverArtwork = new Image();
let ready=false, failed=false, index=0, sheets=[];
let view={width:0,height:0,scale:1,x:0,y:0};
let fold=null, tween=null, pointer=null, frame=0;
const english=()=>document.documentElement.lang==='en';
const tr=pair=>pair[english()?1:0];
const makeCanvas=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const paper=makeCanvas(W,H), paperCtx=paper.getContext('2d');
paperCtx.fillStyle='#faf6eb'; paperCtx.fillRect(0,0,W,H);
let seed=28;
for(let i=0;i<16000;i++) {
  seed=(seed*16807)%2147483647; const x=seed%W;
  seed=(seed*16807)%2147483647; const y=seed%H;
  paperCtx.fillStyle=i%2?'rgba(111,94,59,.025)':'rgba(255,255,255,.3)';
  paperCtx.fillRect(x,y,1,1);
}
function artworkFill(c,artwork,x,y,w,h) {
  const scale=Math.max(w/artwork.naturalWidth,h/artwork.naturalHeight);
  const sw=w/scale,sh=h/scale;
  c.drawImage(artwork,(artwork.naturalWidth-sw)/2,(artwork.naturalHeight-sh)*.5,sw,sh,x,y,w,h);
}
function mirror(image) {
  const m=makeCanvas(HALF,H), c=m.getContext('2d');
  c.translate(HALF,0); c.scale(-1,1); c.drawImage(image,0,0); return m;
}
function makeSheets() {
  if(!ready) return;
  sheets=pages.map(page=>{
    const spread=makeCanvas(W,H), c=spread.getContext('2d');
    if(page.kind==='cover') {
      // Leave the left half transparent: this is one closed cover, never a stretched spread.
      c.drawImage(coverArtwork,HALF,0,HALF,H);
    } else {
      c.drawImage(paper,0,0);
      artworkFill(c,artworks.get(page.asset),8,8,W-16,H-16);
    }
    const left=makeCanvas(HALF,H),right=makeCanvas(HALF,H);
    left.getContext('2d').drawImage(spread,0,0,HALF,H,0,0,HALF,H);
    right.getContext('2d').drawImage(spread,HALF,0,HALF,H,0,0,HALF,H);
    return {spread,left,right,mirrorLeft:mirror(left),mirrorRight:mirror(right)};
  });
}
function updateUI() {
  prev.disabled=!ready || index===0;
  next.disabled=!ready || index===pages.length-1;
  counter.textContent=`${String(index+1).padStart(2,'0')} / ${String(pages.length).padStart(2,'0')}`;
  caption.textContent=tr(pages[index].caption);
  canvas.dataset.page=String(index+1);
  canvas.dataset.state=tween?'settling':pointer?.dragging?'dragging':fold?'corner-preview':'idle';
  canvas.setAttribute('aria-busy',String(!!tween));
  document.querySelector('.sketch-reference').hidden=index===0;
  document.getElementById('sketch-status').textContent=index===0
    ?tr(['独立 AI 手绘封皮 · 莲花与会安灯笼','Original AI-painted cover · Lotus & Hội An lanterns'])
    :tr(['旅行原片 → AI 手绘插画 · 右侧可查看原片对照','Original photo → AI illustration · Compare with the photo at right']);
  if(index>0) {
    const page=pages[index],number=String(index).padStart(2,'0');
    const thumb=photoButton.querySelector('img'),photo=dialog.querySelector('img');
    const [photoWidth,photoHeight]=page.photoSize||[1800,1350];
    const [thumbWidth,thumbHeight]=page.thumbSize||[480,360];
    photo.width=photoWidth; photo.height=photoHeight;
    thumb.width=thumbWidth; thumb.height=thumbHeight;
    const thumbSrc=`assets/vietnam-sketchbook/${page.asset}-thumb.jpg`;
    const photoSrc=`assets/vietnam-sketchbook/${page.asset}-photo.jpg`;
    if(thumb.getAttribute('src')!==thumbSrc) thumb.src=thumbSrc;
    if(photo.getAttribute('src')!==photoSrc) photo.src=photoSrc;
    thumb.alt=photo.alt=tr(page.alt);
    dialog.querySelector('a').setAttribute('href',page.original);
    document.querySelector('.sketch-photo-index').textContent=`${tr(['原片','SOURCE'])} / ${number}`;
    document.getElementById('photo-dialog-title').textContent=`${tr(['旅行原片','Original photo'])} / ${number}`;
  }
  if(failed) loading.textContent=tr(['插画未能加载，请刷新重试。','The illustration could not load. Reload to retry.']);
}
function polygon(c,points) {
  c.beginPath(); points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y)); c.closePath();
}
function rounded(c,x,y,w,h,r) {
  c.beginPath(); c.roundRect(x,y,w,h,r);
}
function renderFold() {
  const f=fold, forward=f.direction===1;
  const old=sheets[index], target=sheets[index+f.direction];
  const a=forward?old.left:old.mirrorRight;
  const b=forward?old.right:old.mirrorLeft;
  const nextA=forward?target.left:target.mirrorRight;
  const nextB=forward?target.right:target.mirrorLeft;
  const geometry=foldGeometry(f.point,W,H,f.corner);
  if(!geometry) { ctx.drawImage(old.spread,0,0); return; }
  ctx.save();
  if(!forward) { ctx.translate(W,0); ctx.scale(-1,1); }
  // Current left page, revealed next right page, then the clipped front and reflected back.
  ctx.save(); rounded(ctx,0,0,W,H,15); ctx.clip();
  ctx.drawImage(a,0,0); ctx.drawImage(nextB,HALF,0);
  if(geometry.front.length>=3) {
    ctx.save(); polygon(ctx,geometry.front); ctx.clip(); ctx.drawImage(b,HALF,0); ctx.restore();
  }
  ctx.restore();
  if(geometry.back.length>=3) {
    const {normal:n,midpoint:m}=geometry;
    // Cast shadow beneath the lifted paper. It follows the polygon, not a fixed overlay.
    ctx.save(); polygon(ctx,geometry.back);
    ctx.shadowColor='rgba(24,27,29,.28)'; ctx.shadowBlur=20;
    ctx.shadowOffsetX=-n.x*9; ctx.shadowOffsetY=10;
    ctx.fillStyle='#f7f2e8'; ctx.fill(); ctx.restore();
    ctx.save(); polygon(ctx,geometry.back); ctx.clip();
    ctx.fillStyle='#faf6eb'; ctx.fillRect(-W,-H,W*3,H*3);
    ctx.save(); ctx.transform(...geometry.matrix);
    ctx.translate(W,0); ctx.scale(-1,1); ctx.drawImage(nextA,0,0); ctx.restore();
    // The bend is a shaded band adjacent to the mathematical fold, with a soft paper highlight.
    const bend=clamp(Math.hypot(W-f.point.x,(f.corner==='top'?0:H)-f.point.y)*.17,18,95);
    const shade=ctx.createLinearGradient(m.x-n.x*bend,m.y-n.y*bend,m.x,m.y);
    shade.addColorStop(0,'rgba(255,251,234,0)');
    shade.addColorStop(.30,'rgba(255,251,234,.19)');
    shade.addColorStop(.69,'rgba(255,251,234,.04)');
    shade.addColorStop(1,'rgba(24,31,33,.32)');
    ctx.fillStyle=shade; ctx.fillRect(-W,-H,W*3,H*3);
    ctx.restore();
    if(geometry.line.length>=2) {
      ctx.beginPath(); ctx.moveTo(geometry.line[0].x,geometry.line[0].y); ctx.lineTo(geometry.line[1].x,geometry.line[1].y);
      ctx.strokeStyle='rgba(255,250,235,.55)'; ctx.lineWidth=1; ctx.stroke();
    }
  }
  ctx.restore();
}
function render() {
  if(!ctx || !view.width || !view.height) return;
  ctx.clearRect(0,0,view.width,view.height);
  if(!ready) return;
  const book=bookTransform(),left=HALF*book.closed,width=W-left;
  const backing=bookBackingBounds();
  ctx.save(); ctx.translate(book.x,book.y); ctx.scale(book.scale,book.scale);
  ctx.save(); rounded(ctx,backing.left-4,3,backing.width+8,H+4,17);
  ctx.shadowColor='rgba(47,38,22,.16)'; ctx.shadowBlur=36; ctx.shadowOffsetY=16;
  ctx.fillStyle='#e9e3d6'; ctx.fill(); ctx.restore();
  for(let i=3;i>=1;i--) {
    rounded(ctx,backing.left-i*.6,i*1.6,backing.width+i*1.2,H,15); ctx.fillStyle=i%2?'#e9e4d9':'#fdf9ee'; ctx.fill();
  }
  if(fold) renderFold();
  else {
    ctx.save(); rounded(ctx,left,0,width,H,15); ctx.clip(); ctx.drawImage(sheets[index].spread,0,0); ctx.restore();
  }
  // A quiet center gutter remains visible on the flat pages, not painted over the lifted sheet.
  if(!fold && index!==0) {
    const spine=ctx.createLinearGradient(HALF-26,0,HALF+26,0);
    spine.addColorStop(0,'rgba(38,29,19,0)'); spine.addColorStop(.46,'rgba(38,29,19,.06)');
    spine.addColorStop(.50,'rgba(38,29,19,.23)'); spine.addColorStop(.55,'rgba(255,255,246,.14)'); spine.addColorStop(1,'rgba(38,29,19,0)');
    ctx.fillStyle=spine; ctx.fillRect(HALF-26,1,52,H-2);
  }
  if(!fold && index===0) {
    const binding=ctx.createLinearGradient(HALF,0,HALF+24,0);
    binding.addColorStop(0,'rgba(55,40,25,.12)');binding.addColorStop(.4,'rgba(255,255,255,.16)');binding.addColorStop(1,'rgba(55,40,25,0)');
    ctx.fillStyle=binding;ctx.fillRect(HALF,6,24,H-12);
  }
  if(!fold && canvas.matches(':focus-visible')) {
    rounded(ctx,left-8,-8,width+16,H+16,21); ctx.strokeStyle='#9aabae';ctx.lineWidth=1.5;ctx.stroke();
  }
  ctx.restore();
}
function bookBackingBounds() {
  // While the cover opens/closes, only the right-hand page stack exists.
  // Do not grow a solid rectangle under the empty left side; the folded page
  // already draws its own silhouette and shadow over the transparent canvas.
  const coverTransition=index===0 || (index===1 && fold?.direction===-1);
  const left=coverTransition?HALF:0;
  return {left,width:W-left};
}
function bookTransform() {
  const progress=fold?clamp((W-fold.point.x)/W,0,1):0;
  const closed=index===0?1-progress:index===1 && fold?.direction===-1?progress:0;
  const scale=view.scale*(1+closed*((view.coverZoom||1)-1));
  return {closed,scale,x:(view.width-W*scale)/2-HALF/2*closed*scale+(view.centerOffset||0)*closed,y:(view.height-H*scale)/2-5};
}
function localPoint(event) {
  const r=canvas.getBoundingClientRect(),book=bookTransform();
  return {x:(event.clientX-r.left-book.x)/book.scale,y:(event.clientY-r.top-book.y)/book.scale};
}
function canTurn(direction) {return ready && index+direction>=0 && index+direction<pages.length;}
function finish(commit) {
  if(commit && fold) index+=fold.direction;
  fold=null; tween=null; pointer=null; canvas.classList.remove('is-dragging');
  updateUI(); render();
}
function animate(now) {
  frame=0;
  if(!tween || !fold) return;
  const raw=clamp((now-tween.start)/tween.duration,0,1);
  const t=raw<.5?4*raw*raw*raw:1-Math.pow(-2*raw+2,3)/2;
  fold.point={x:tween.from.x+(tween.to.x-tween.from.x)*t,y:tween.from.y+(tween.to.y-tween.from.y)*t};
  // An automatic turn lifts the selected corner before it settles at the opposite edge.
  if(tween.arch) fold.point.y+=(fold.corner==='top'?1:-1)*Math.sin(Math.PI*t)*tween.arch;
  render();
  if(raw>=1) {finish(tween.commit);return;}
  frame=requestAnimationFrame(animate);
}
function settle(commit,automatic=false) {
  if(!fold) return;
  if(reducedMotion.matches) {finish(commit);return;}
  const cy=fold.corner==='top'?0:H;
  tween={from:{...fold.point},to:{x:commit?0:W,y:cy},commit,
    start:performance.now(),duration:automatic?1050:commit?620:380,arch:automatic?190:0};
  updateUI(); cancelAnimationFrame(frame); frame=requestAnimationFrame(animate);
}
function turn(direction) {
  if(tween || pointer || !canTurn(direction)) return;
  fold={direction,corner:'bottom',point:{x:W-1,y:H-1}};
  settle(true,true);
}
function clearPreview() {if(fold && !pointer && !tween) {fold=null;updateUI();render();}}
prev.addEventListener('click',()=>turn(-1));
next.addEventListener('click',()=>turn(1));
canvas.addEventListener('pointerdown',event=>{
  if(!event.isPrimary || event.button!==0 || tween || !ready) return;
  const p=localPoint(event);
  if(p.x<0 || p.x>W || p.y<0 || p.y>H) return;
  const direction=p.x>HALF?1:-1;
  if(!canTurn(direction)) return;
  const corner=p.y<H/2?'top':'bottom';
  pointer={id:event.pointerId,start:p,last:p,screenX:event.clientX,screenY:event.clientY,scale:bookTransform().scale,time:performance.now(),direction,corner,dragging:false};
  fold={direction,corner,point:{x:W-1,y:corner==='top'?1:H-1}};
  canvas.setPointerCapture(event.pointerId); canvas.focus({preventScroll:true}); updateUI();
});
canvas.addEventListener('pointermove',event=>{
  if(tween || !ready) return;
  const p=localPoint(event);
  if(pointer) {
    if(pointer.id!==event.pointerId) return;
    // Screen deltas keep dragging stable while the book recenters and changes scale.
    const dx=(event.clientX-pointer.screenX)/pointer.scale*pointer.direction,dy=(event.clientY-pointer.screenY)/pointer.scale;
    if(Math.hypot(dx,dy)>8) pointer.dragging=true;
    if(!pointer.dragging) return;
    const cornerY=pointer.corner==='top'?0:H;
    const progress=clamp(-dx/W,0,1);
    fold.point={x:clamp(W+dx,0,W-1),y:cornerY+dy+(pointer.corner==='top'?1:-1)*Math.sin(progress*Math.PI)*30};
    pointer.last=p; canvas.classList.add('is-dragging'); updateUI(); render(); return;
  }
  if(!finePointer.matches || reducedMotion.matches) return;
  const direction=p.x>HALF?1:-1,edge=direction===1?W-p.x:p.x;
  const cornerDistance=Math.min(p.y,H-p.y);
  if(edge>=0 && edge<105 && cornerDistance>=0 && cornerDistance<130 && canTurn(direction)) {
    const corner=p.y<H/2?'top':'bottom';
    fold={direction,corner,point:{x:W-48,y:corner==='top'?37:H-37}};
    updateUI();render();
  } else clearPreview();
});
canvas.addEventListener('pointerup',event=>{
  if(!pointer || event.pointerId!==pointer.id) return;
  const p=pointer;
  pointer=null; canvas.classList.remove('is-dragging');
  if(!p.dragging) {settle(true,true);return;}
  const progress=(W-fold.point.x)/W;
  const flick=performance.now()-p.time<330 && progress>.12;
  settle(progress>.32 || flick);
});
function cancelDrag() {
  if(!pointer) return;
  pointer=null; canvas.classList.remove('is-dragging'); settle(false);
}
canvas.addEventListener('pointercancel',cancelDrag);
canvas.addEventListener('lostpointercapture',cancelDrag);
canvas.addEventListener('pointerleave',clearPreview);
canvas.addEventListener('focus',()=>requestAnimationFrame(render));
canvas.addEventListener('blur',()=>{clearPreview();render();});
canvas.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key) || tween || pointer || !ready) return;
  event.preventDefault(); clearPreview();
  if(event.key==='Home' || event.key==='End') {index=event.key==='Home'?0:pages.length-1;updateUI();render();}
  else turn(event.key==='ArrowRight'?1:-1);
});
function resize() {
  cancelAnimationFrame(frame);
  if(tween?.commit && fold) index+=fold.direction;
  fold=null;tween=null;pointer=null;canvas.classList.remove('is-dragging');
  const r=canvas.getBoundingClientRect(),area=canvas.parentElement.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
  const scale=Math.min((area.width-28)/W,(area.height-28)/H);
  const coverScale=Math.min((area.width-60)/HALF,(area.height-28)/H);
  const centerOffset=(canvas.closest('.sketch-view').getBoundingClientRect().width-area.width)/2;
  view={width:r.width,height:r.height,scale:Math.max(.01,scale),coverZoom:Math.max(1,coverScale/Math.max(.01,scale)),centerOffset};
  canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);updateUI();render();
}
photoButton.addEventListener('click',()=>{
  clearPreview();dialog.showModal();document.body.classList.add('modal-open');
});
document.getElementById('sketch-photo-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{
  if(event.target!==dialog) return;
  const r=dialog.getBoundingClientRect();
  if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) dialog.close();
});
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');photoButton.focus();});
new MutationObserver(()=>{
  cancelAnimationFrame(frame);if(tween?.commit && fold) index+=fold.direction;
  fold=null;tween=null;pointer=null;canvas.classList.remove('is-dragging');
  makeSheets();updateUI();render();
}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
reducedMotion.addEventListener('change',()=>{if(fold){cancelAnimationFrame(frame);finish(!!tween?.commit);}});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden && fold) {cancelAnimationFrame(frame);finish(!!tween?.commit);}
});
new ResizeObserver(resize).observe(canvas);
function assetsLoaded() {
  if(!coverArtwork.naturalWidth || [...artworks.values()].some(artwork=>!artwork.naturalWidth)) return;
  ready=true;loading.hidden=true;makeSheets();updateUI();resize();
}
coverArtwork.onload=assetsLoaded;
coverArtwork.onerror=()=>{failed=true;loading.hidden=false;updateUI();};
for(const [asset,artwork] of artworks) {
  artwork.onload=assetsLoaded;
  artwork.onerror=coverArtwork.onerror;
  artwork.src=`assets/vietnam-sketchbook/${asset}-illustration.jpg`;
}
coverArtwork.src='assets/vietnam-sketchbook/vietnam-cover.jpg';
updateUI();resize();
