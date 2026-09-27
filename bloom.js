'use strict';
(() => {
  const button = document.getElementById('bloom-toggle');
  if (!button) return;
  const modules = document.getElementById('qr-modules');
  const cells = [...modules.querySelectorAll('rect')];
  const scene = document.getElementById('rose-scene');
  const heads = [...scene.querySelectorAll('.rose-head')];
  const hint = document.getElementById('bloom-hint');
  const options = document.getElementById('bloom-options');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const size = Number(cells[0].getAttribute('width'));
  const count = Math.round(160 / size) - 8;
  const isFinder = cell => {
    const x = Math.round(Number(cell.dataset.x) / size) - 4;
    const y = Math.round(Number(cell.dataset.y) / size) - 4;
    return (x < 7 && y < 7) || (x >= count - 7 && y < 7) || (x < 7 && y >= count - 7);
  };
  const floralCells = cells.filter(cell => !isFinder(cell));
  let expanded = false, shape = 'flower', animations = [], visible = true;
  function labels() {
    const en = document.documentElement.lang === 'en';
    const name = shape === 'logo' ? (en ? 'brand logo' : '品牌 Logo') : (en ? 'rose bouquet' : '玫瑰花束');
    button.setAttribute('aria-label', expanded ? (en ? 'Gather into the '+name : '收拢为'+name) : (en ? 'Reveal the WeCom QR code' : '展开企业微信二维码'));
    hint.textContent = expanded ? (en ? 'Scan to connect · Tap to gather' : '扫码联系 · 点击收拢') : (en ? 'Tap the '+name+' to reveal a connection' : '点击'+name+'，让连接展开');
  }
  function move(element, target, animate, delay = 0) {
    const start = getComputedStyle(element).transform;
    element.style.transform = target;
    if (animate && !reduced.matches) animations.push(element.animate([{transform:start},{transform:target}],{
      duration:1000,delay,easing:'cubic-bezier(.22,.8,.2,1)',fill:'backwards'
    }));
  }
  function render(animate = true) {
    // Commit current visual poses before interrupting a transition.
    animations.forEach(a => { if (a.playState !== 'finished') { try { a.commitStyles(); } catch {} } a.cancel(); });
    animations = [];
    button.dataset.shape = shape;
    button.setAttribute('aria-expanded', String(expanded));
    options.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.shape === shape)));
    modules.style.opacity = shape === 'flower' && !expanded ? '0' : '1';
    scene.style.opacity = shape === 'flower' ? '1' : '0';
    cells.forEach((cell,i) => {
      const x = expanded ? cell.dataset.x : shape === 'logo' ? cell.dataset.lx : cell.dataset.fx;
      const y = expanded ? cell.dataset.y : shape === 'logo' ? cell.dataset.ly : cell.dataset.fy;
      move(cell,'translate('+x+'px,'+y+'px)',animate,(i%17)*9);
      cell.style.fill = shape === 'logo' ? '#101010' : isFinder(cell) ? '#2b4e96' : ['#783044','#83384b','#713044'][i%3];
      cell.setAttribute('rx','0');
    });
    heads.forEach((head,i) => {
      const cell = floralCells[Math.floor(i*floralCells.length/heads.length)];
      const x = expanded ? Number(cell.dataset.x)+size/2 : head.dataset.homeX;
      const y = expanded ? Number(cell.dataset.y)+size/2 : head.dataset.homeY;
      const scale = expanded ? size/25 : head.dataset.homeScale;
      move(head,'translate('+x+'px,'+y+'px) scale('+scale+')',animate,i*8);
    });
    labels();
  }
  // Small rose and leaf accents remain entirely inside dark QR modules.
  const ns='http://www.w3.org/2000/svg';
  const accents=document.createElementNS(ns,'g');
  accents.setAttribute('class','rose-qr-accents');
  floralCells.forEach((cell,i)=>{
    if(i%4!==0)return;
    const use=document.createElementNS(ns,'use');
    const rose=i%12!==0;
    use.setAttribute('href',rose?'#rose-flower':'#rose-leaf-shape');
    const scale=rose?size/27:size/27;
    use.setAttribute('transform','translate('+(Number(cell.dataset.x)+size/2)+' '+(Number(cell.dataset.y)+(rose?size/2:size*.88))+') scale('+scale+')');
    accents.append(use);
  });
  scene.append(accents);
  button.hidden = false;
  options.hidden = false;
  render(false);
  button.addEventListener('click',()=>{expanded=!expanded;render();});
  options.addEventListener('click',e=>{
    const choice=e.target.closest('[data-shape]');
    if(!choice)return;
    shape=choice.dataset.shape;
    expanded=false;
    render();
  });
  new MutationObserver(labels).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  function pause() { button.classList.toggle('bloom-paused',!visible||document.hidden); }
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;pause();});
  observer.observe(button);
  document.addEventListener('visibilitychange',pause);
})();
