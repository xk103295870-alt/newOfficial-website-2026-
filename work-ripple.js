'use strict';
// Original Canvas pixel-reveal treatment inspired by Koi Studies' interaction.
// No third-party masks, videos, artwork or renderer code are used.
(() => {
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const forced = matchMedia('(forced-colors: active)');
  const controllers = [];
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const smooth = x => { const t = clamp(x, 0, 1); return t*t*(3-2*t); };
  document.querySelectorAll('#work .case-media').forEach(cover => {
    const canvas = document.createElement('canvas');
    canvas.className = 'work-ripple';
    canvas.setAttribute('aria-hidden','true');
    cover.append(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) { canvas.remove(); return; }
    let width=0,height=0,tile=9,grid=[],frame=0,trail=[],previous=null;
    let entered=false,inView=true,strength=0,lastTime=0,lastPaint=0,lastMove=0,phase=0,targetPhase=0;
    const enabled = () => fine.matches && !reduced.matches && !forced.matches && !document.hidden && inView;
    function stop() {
      cancelAnimationFrame(frame);frame=0;entered=false;strength=0;
      trail=[];previous=null;lastTime=0;lastPaint=0;
      ctx.clearRect(0,0,width,height);
    }
    function size() {
      const box=cover.getBoundingClientRect();
      width=box.width;height=box.height;
      tile=clamp(width/70,7,12);
      const ratio=Math.min(devicePixelRatio||1,2);
      canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
      ctx.setTransform(ratio,0,0,ratio,0,0);
      grid=[];
      for(let y=0;y<height;y+=tile) for(let x=0;x<width;x+=tile) {
        const v=Math.sin(x*12.9898+y*78.233)*43758.5453;
        grid.push({x,y,noise:v-Math.floor(v)});
      }
      canvas.dataset.effect='pixel-reveal';
    }
    function wake() {
      if(!frame) { lastTime=performance.now();frame=requestAnimationFrame(draw); }
    }
    function draw(now) {
      frame=0;
      if(!enabled()) {stop();return;}
      if(now-lastPaint<32) {frame=requestAnimationFrame(draw);return;}
      const dt=Math.min(now-lastTime,64);
      lastTime=now;lastPaint=now;
      strength += ((entered?1:0)-strength)*(1-Math.exp(-dt/180));
      phase += (targetPhase-phase)*(1-Math.exp(-dt/145));
      trail=trail.filter(p=>now-p.time<850);
      ctx.clearRect(0,0,width,height);
      if(!entered && strength<.008) { stop();return; }
      // The card's own background is the veil, so photographs/lettering reveal
      // underneath it instead of an unrelated circle being drawn over them.
      ctx.fillStyle=getComputedStyle(cover).backgroundColor;
      for(const cell of grid) {
        const u=(cell.x+tile/2)/width,v=(cell.y+tile/2)/height;
        const field=Math.sin(u*15+v*7+phase*4)
          + .55*Math.sin(v*23-u*8-phase*2)
          + .3*Math.sin(u*38+v*31+phase);
        const band=smooth((field+cell.noise*.65+.15)/1.6);
        let reveal=0;
        for(const point of trail) {
          const life=1-(now-point.time)/850;
          const dx=cell.x+tile/2-point.x;
          const dy=cell.y+tile/2-point.y;
          const bend=Math.sin(dy*.035+phase*2)*12*life;
          const distance=Math.hypot(dx+bend,dy);
          const radius=point.radius*(.55+.45*life);
          const coverage=smooth((radius-distance+(cell.noise-.5)*tile*2)/(radius*.45));
          reveal=Math.max(reveal,coverage*smooth(life*2));
        }
        const alpha=strength*(.08+band*.64)*(1-reveal);
        if(alpha>.005) {ctx.globalAlpha=alpha;ctx.fillRect(cell.x,cell.y,tile+.35,tile+.35);}
      }
      ctx.globalAlpha=1;
      // Settle to a still surface when the pointer rests. No perpetual rendering.
      if(trail.length || Math.abs(phase-targetPhase)>.002 || Math.abs(strength-(entered?1:0))>.002)
        frame=requestAnimationFrame(draw);
    }
    function emit(event) {
      if(!enabled() || event.pointerType==='touch')return;
      const box=cover.getBoundingClientRect(), now=performance.now();
      const x=event.clientX-box.left,y=event.clientY-box.top;
      if(previous && now-lastMove<24)return;
      const distance=previous?Math.hypot(x-previous.x,y-previous.y):0;
      const speed=clamp(distance/Math.max(8,now-lastMove)/1.5,0,1);
      const radius=Math.min(width,height)*(.10+speed*.12);
      // Fill gaps during fast pointer movements.
      const steps=previous?Math.min(5,Math.max(1,Math.ceil(distance/24))):1;
      for(let i=1;i<=steps;i++) trail.push({
        x:previous?previous.x+(x-previous.x)*i/steps:x,
        y:previous?previous.y+(y-previous.y)*i/steps:y,
        radius,time:now
      });
      trail=trail.slice(-24);
      entered=true;previous={x,y};lastMove=now;
      targetPhase=x/width*.72+(1-y/height)*.28;
      wake();
    }
    cover.addEventListener('pointerenter',event=>{previous=null;emit(event);});
    cover.addEventListener('pointermove',emit);
    cover.addEventListener('pointerleave',()=>{entered=false;previous=null;if(strength>0)wake();});
    cover.addEventListener('pointercancel',stop);
    new ResizeObserver(()=>{stop();size();}).observe(cover);
    new IntersectionObserver(entries=>{
      inView=entries[0].isIntersecting;if(!inView)stop();
    }).observe(cover);
    controllers.push(stop);
  });
  const reset=()=>controllers.forEach(stop=>stop());
  [fine,reduced,forced].forEach(query=>query.addEventListener('change',reset));
  document.addEventListener('visibilitychange',reset);
  window.addEventListener('blur',reset);
})();
