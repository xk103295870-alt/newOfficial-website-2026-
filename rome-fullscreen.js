// Fullscreen API first; embedded browsers can use an in-page immersive fallback.
export function installRomeFullscreen(doc, button, events = globalThis.window) {
 const root=doc.documentElement;
 let fallback=false,busy=false,disposed=false;
 const active=()=>doc.fullscreenElement===root||fallback;
 function sync(){
  if(disposed)return;
  const on=active(),en=root.lang==='en';
  root.classList.toggle('rome-immersive',on);
  button.setAttribute('aria-pressed',String(on));
  button.dataset.mode=on?(fallback?'immersive':'fullscreen'):'window';
  button.textContent=on?(en?(fallback?'Exit immersive':'Exit fullscreen'):(fallback?'退出沉浸':'退出全屏')):(en?'Fullscreen':'全屏展示');
  button.title=on?(en?'Exit · Esc':'退出 · Esc'):(en?'Show city fullscreen':'全屏展示城市');
 }
 function restoreFocus(){button.focus({preventScroll:true});}
 async function toggle(){
  if(busy||disposed)return;
  busy=true;button.disabled=true;
  try{
   if(fallback){fallback=false;}
   else if(doc.fullscreenElement===root){await doc.exitFullscreen();}
   else if(root.requestFullscreen&&doc.fullscreenEnabled!==false){
    try{await root.requestFullscreen();}catch{if(!disposed)fallback=true;}
   }else fallback=true;
  }catch{
   // A rejected exit leaves the actual browser state authoritative.
  }finally{
   busy=false;
   if(!disposed){button.disabled=false;sync();restoreFocus();}
  }
 }
 function changed(){fallback=false;sync();if(!doc.fullscreenElement)restoreFocus();}
 function keydown(e){
  if(e.key!=='Escape')return;
  if(fallback){fallback=false;sync();restoreFocus();}
  else if(doc.fullscreenElement===root)void toggle();
 }
 button.addEventListener('click',toggle);
 doc.addEventListener('fullscreenchange',changed);
 doc.addEventListener('keydown',keydown);
 events.addEventListener('rome-language-change',sync);
 sync();
 return ()=>{
  disposed=true;root.classList.remove('rome-immersive');
  button.removeEventListener('click',toggle);
  doc.removeEventListener('fullscreenchange',changed);
  doc.removeEventListener('keydown',keydown);
  events.removeEventListener('rome-language-change',sync);
 };
}
