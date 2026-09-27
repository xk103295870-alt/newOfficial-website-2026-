import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const html = await readFile(new URL('../chengdu-city.html', import.meta.url), 'utf8');
const js = await readFile(new URL('../chengdu-game.js', import.meta.url), 'utf8');
const entry = await readFile(new URL('../chengdu.js', import.meta.url), 'utf8');
const lab = await readFile(new URL('../ai-lab.html', import.meta.url), 'utf8');

assert(html.includes('成都天府站'));
assert(html.includes('scene-auto'));
assert(html.includes('scene-day'));
assert(html.includes('scene-night'));
assert(html.includes('scene-pause'));
assert(html.includes('chengdu.js?v=tianfu-1'));
assert(js.includes('TIANFU'));
assert(js.includes('成 都 天 府 站'));
assert(js.includes('PANDA BASE'));
assert(js.includes('requestAnimationFrame'));
assert(entry.includes('chengdu-game.js?v=tianfu-1'));
assert(lab.includes('成都天府站像素旅行'));
assert(lab.includes('chengdu-tianfu-cover.svg'));
assert.equal((lab.match(/href="chengdu-city.html"/g) || []).length, 2);

await access(new URL('../assets/chengdu-tianfu-cover.svg', import.meta.url));
await access(new URL('../chengdu-game.js', import.meta.url));

console.log('PASS: Tianfu Station scene, landmark labels, day/night controls, animated train, and lab entry are wired.');
