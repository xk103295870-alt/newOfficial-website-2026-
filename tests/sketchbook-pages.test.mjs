import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const source = readFileSync(new URL('vietnam-sketchbook.js', root), 'utf8');
const pageDefinition = source.match(/const pages=(\[[\s\S]*?\n\]);/)[1];
const pages = vm.runInNewContext(pageDefinition);
assert.equal(pages.length, 17);
assert.equal(pages[0].kind, 'cover');
assert.deepEqual(Array.from(pages.slice(1), page => page.asset), ['river-01', 'hoi-an-02', 'fireworks-03', 'da-nang-04', 'train-street-05', 'fishing-06', 'beach-sun-07', 'beach-palms-08', 'beach-crowd-09', 'beach-evening-10', 'cafe-11', 'street-noodles-12', 'son-tra-13', 'vietnam-meal-14', 'hoi-an-rice-15', 'hanoi-fish-16']);
assert.deepEqual(Array.from(pages[5].photoSize), [1350,1800]);
assert.deepEqual(Array.from(pages[5].thumbSize), [360,480]);
for (const page of pages.slice(1)) {
  for (const suffix of ['illustration', 'photo', 'thumb']) {
    assert.ok(existsSync(new URL(`assets/vietnam-sketchbook/${page.asset}-${suffix}.jpg`, root)));
  }
  assert.ok(existsSync(new URL(page.original, root)));
  assert.equal(page.alt.length, 2);
  assert.equal(page.caption.length, 2);
}

// A backward turn between illustrations must not trigger the cover's closing transform.
const transform = source.match(/function bookTransform\(\) \{[\s\S]*?\n\}/)[0];
const context = vm.createContext({
  W:1200, H:720, HALF:600, index:2, fold:{point:{x:600},direction:-1},
  view:{width:1400,height:920,scale:1,coverZoom:1.4,centerOffset:70},
  clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
});
vm.runInContext(transform, context);
for (let index=2; index<pages.length; index++) {
  context.index=index;
  assert.equal(vm.runInContext('bookTransform().closed', context), 0);
}
context.index=1;
assert.equal(vm.runInContext('bookTransform().closed', context), .5);
context.index=0; context.fold=null;
assert.equal(vm.runInContext('bookTransform().closed', context), 1);
const backing=source.match(/function bookBackingBounds\(\) \{[\s\S]*?\n\}/)[0];
vm.runInContext(backing, context);
for (const x of [1199,1000,800,600,300,1]) {
  for (const [index,direction] of [[0,1],[1,-1]]) {
    context.index=index; context.fold={point:{x},direction};
    assert.equal(vm.runInContext('bookBackingBounds().left', context), 600);
    assert.equal(vm.runInContext('bookBackingBounds().width', context), 600);
  }
}
context.index=1; context.fold=null;
assert.equal(vm.runInContext('bookBackingBounds().left', context), 0);
assert.equal(vm.runInContext('bookBackingBounds().width', context), 1200);
context.index=2; context.fold={point:{x:600},direction:-1};
assert.equal(vm.runInContext('bookBackingBounds().left', context), 0);
console.log('PASS: page order, bilingual captions, artwork/source assets, and interior/cover transitions.');
