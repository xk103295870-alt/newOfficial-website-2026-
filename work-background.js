'use strict';
// Actual SourceGraphic displacement: the artwork and its text are refracted,
// not covered by another colored layer. A small RG map drives an SVG filter.
(() => {
 const covers=[...document.querySelectorAll('#work .case-media')];
 if(!covers.length)return;
 const fine=matchMedia('(hover: hover) and (pointer: fine)');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const forced=matchMedia('(forced-colors: active)');
 const ns='http://www.w3.org/2000/svg';
 const svg=document.createElementNS(ns,'svg');
 svg.setAttribute('aria-hidden','true');
 svg.setAttribute('width','0');svg.setAttribute('height','0');
 svg.style.cssText='position:absolute;pointer-events:none;overflow:hidden';
 const defs=document.createElementNS(ns,'defs');svg.append(defs);document.body.append(svg);
 const map=document.createElement('canvas'),ctx=map.getContext('2d');
 if(!ctx)return;
 const N=112;map.width=N;map.height=N;
 const pixels=ctx.createImageData(N,N);
 const controllers=[];
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 covers.forEach((cover,index)=>{
  const filter=document.createElementNS(ns,'filter');
  filter.id='work-liquid-'+index;
  filter.setAttribute('filterUnits','userSpaceOnUse');
  filter.setAttribute('primitiveUnits','userSpaceOnUse');
  filter.setAttribute('x','0');filter.setAttribute('y','0');
  filter.setAttribute('color-interpolation-filters','sRGB');
  const image=document.createElementNS(ns,'feImage');
  image.setAttribute('result','displacement');
  image.setAttribute('preserveAspectRatio','none');
  image.setAttribute('x','0');image.setAttribute('y','0');
  const displacement=document.createElementNS(ns,'feDisplacementMap');
  displacement.setAttribute('in','SourceGraphic');displacement.setAttribute('in2','displacement');
  displacement.setAttribute('xChannelSelector','R');displacement.setAttribute('yChannelSelector','G');
  displacement.setAttribute('scale','54');
  filter.append(image,displacement);defs.append(filter);
  let width=1,height=1,points=[],previous=null,lastMove=0,frame=0,lastPaint=0,inView=true;
  const enabled=()=>fine.matches&&!reduced.matches&&!forced.matches&&!document.hidden&&inView;
  function stop(){
   cancelAnimationFrame(frame);frame=0;points=[];previous=null;
   cover.style.removeProperty('filter');
   cover.classList.remove('is-liquid-active');
  }
  function resize(){
   stop();const box=cover.getBoundingClientRect();width=box.width;height=box.height;
   filter.setAttribute('width',width);filter.setAttribute('height',height);
   image.setAttribute('width',width);image.setAttribute('height',height);
   displacement.setAttribute('scale',Math.min(64,width*.10));
  }
  function draw(now){
   frame=0;if(!enabled()){stop();return;}
   if(now-lastPaint<32){frame=requestAnimationFrame(draw);return;}
   lastPaint=now;points=points.filter(p=>now-p.time<1350);
   if(!points.length){stop();return;}
   const data=pixels.data;
   // Neutral 128/128 means unchanged pixels. Disturbances are localized and
   // return to neutral, preserving every original color and image detail.
   for(let row=0;row<N;row++)for(let col=0;col<N;col++){
    const x=(col+.5)/N*width,y=(row+.5)/N*height;
    let dx=0,dy=0;
    for(const p of points){
     const age=(now-p.time)/1000;
     const rx=x-p.x,ry=y-p.y,dist=Math.hypot(rx,ry);
     const radius=p.radius+age*58;
     if(dist>radius*2.1)continue;
     const envelope=Math.exp(-dist*dist/(radius*radius))*Math.pow(1-age/1.35,2);
     const wave=Math.sin(dist*.085-age*9);
     const eddy=Math.sin(rx*.055+age*3)*Math.cos(ry*.047-age*2);
     const inv=1/Math.max(dist,1);
     dx+=(rx*inv*wave*.65-ry*inv*eddy*.42+p.vx*.24)*envelope*p.power;
     dy+=(ry*inv*wave*.65+rx*inv*eddy*.42+p.vy*.24)*envelope*p.power;
    }
    // Fade the displacement at the card boundary; don't tear card edges.
    const edge=clamp(Math.min(x,y,width-x,height-y)/18,0,1);
    const i=(row*N+col)*4;
    data[i]=Math.round(128+clamp(dx*edge,-1,1)*116);
    data[i+1]=Math.round(128+clamp(dy*edge,-1,1)*116);
    data[i+2]=128;data[i+3]=255;
   }
   ctx.putImageData(pixels,0,0);
   image.setAttribute('href',map.toDataURL('image/png'));
   cover.style.filter='url(#'+filter.id+')';
   cover.classList.add('is-liquid-active');
   frame=requestAnimationFrame(draw);
  }
  function move(event){
   if(!enabled()||event.pointerType==='touch')return;
   const now=performance.now(),box=cover.getBoundingClientRect();
   const x=event.clientX-box.left,y=event.clientY-box.top;
   if(previous&&now-lastMove<35)return;
   const dx=previous?x-previous.x:0,dy=previous?y-previous.y:0;
   const distance=Math.hypot(dx,dy);
   if(previous&&distance<2)return;
   const speed=clamp(distance/Math.max(16,now-lastMove),0,2);
   const steps=previous?Math.min(3,Math.max(1,Math.ceil(distance/35))):1;
   for(let step=1;step<=steps;step++)points.push({
    x:previous?previous.x+dx*step/steps:x,y:previous?previous.y+dy*step/steps:y,
    time:now,radius:Math.min(width,height)*(.09+speed*.025),
    vx:dx/Math.max(distance,1),vy:dy/Math.max(distance,1),power:(.7+speed*.22)/Math.sqrt(steps)
   });
   points=points.slice(-12);previous={x,y};lastMove=now;
   if(!frame)frame=requestAnimationFrame(draw);
  }
  cover.addEventListener('pointerenter',e=>{previous=null;move(e);});
  cover.addEventListener('pointermove',move);
  cover.addEventListener('pointerleave',()=>{previous=null;});
  cover.addEventListener('pointercancel',stop);
  new ResizeObserver(resize).observe(cover);
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(!inView)stop();}).observe(cover);
  controllers.push(stop);
 });
 const reset=()=>controllers.forEach(stop=>stop());
 [fine,reduced,forced].forEach(q=>q.addEventListener('change',reset));
 document.addEventListener('visibilitychange',reset);window.addEventListener('blur',reset);
})();
