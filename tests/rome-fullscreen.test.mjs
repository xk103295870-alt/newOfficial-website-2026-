import assert from 'node:assert/strict';
import {installRomeFullscreen} from '../rome-fullscreen.js';
class Target extends EventTarget {
 attributes={};dataset={};disabled=false;focus(){}
 setAttribute(k,v){this.attributes[k]=v;}
}
function fixture(mode='native'){
 const doc=new Target(),button=new Target(),events=new Target(),classes=new Set();
 doc.documentElement={lang:'zh-CN',classList:{toggle(k,v){v?classes.add(k):classes.delete(k);},remove(k){classes.delete(k);}}};
 doc.fullscreenElement=null;doc.fullscreenEnabled=mode!=='unsupported';
 doc.documentElement.requestFullscreen=async()=>{
  if(mode==='rejected')throw Error('Embedded browser denied fullscreen');
  doc.fullscreenElement=doc.documentElement;doc.dispatchEvent(new Event('fullscreenchange'));
 };
 doc.exitFullscreen=async()=>{doc.fullscreenElement=null;doc.dispatchEvent(new Event('fullscreenchange'));};
 const cleanup=installRomeFullscreen(doc,button,events);
 const click=async()=>{button.dispatchEvent(new Event('click'));await new Promise(r=>setImmediate(r));};
 const escape=()=>{const e=new Event('keydown');Object.defineProperty(e,'key',{value:'Escape'});doc.dispatchEvent(e);};
 return {doc,button,events,classes,cleanup,click,escape};
}
const native=fixture();await native.click();
assert.equal(native.button.dataset.mode,'fullscreen');assert(native.classes.has('rome-immersive'));
native.doc.documentElement.lang='en';native.events.dispatchEvent(new Event('rome-language-change'));
assert.equal(native.button.textContent,'Exit fullscreen');
await native.click();assert.equal(native.button.attributes['aria-pressed'],'false');
await native.click();await native.doc.exitFullscreen();assert(!native.classes.has('rome-immersive'),'Browser Escape/external exits synchronize');
native.cleanup();await native.click();assert.equal(native.doc.fullscreenElement,null);
for(const mode of ['unsupported','rejected']){
 const f=fixture(mode);await f.click();assert.equal(f.button.dataset.mode,'immersive');assert.equal(f.button.textContent,'退出沉浸');
 f.escape();assert(!f.classes.has('rome-immersive'));await f.click();await f.click();assert.equal(f.button.dataset.mode,'window');
 f.cleanup();
}
console.log('PASS: native enter/exit, browser exit sync, bilingual labels, fallback, Escape and cleanup.');
