import { installRomeFullscreen } from './rome-fullscreen.js';
import { mountRomeCityScene } from './rome-city-scene.js?v=civic-life-20261007';

const languageButton = document.getElementById('lang-toggle');
const languageMenu = document.getElementById('lang-menu');
const languageOptions = [...document.querySelectorAll('[data-lang]')];

function applyLanguage(language) {
  document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
  document.title = language === 'en' ? 'Rome Line City — WNTC AI Creative Lab' : '罗马线稿城市 — WNTC AI创意实验';
  for (const element of document.querySelectorAll('[data-en]')) {
    if (!element.dataset.zh) element.dataset.zh = element.innerHTML;
    element.innerHTML = language === 'en' ? element.dataset.en : element.dataset.zh;
  }
  for (const element of document.querySelectorAll('[data-en-label]')) {
    if (!element.dataset.zhLabel) element.dataset.zhLabel = element.getAttribute('aria-label') || '';
    element.setAttribute('aria-label', language === 'en' ? element.dataset.enLabel : element.dataset.zhLabel);
  }
  document.getElementById('lang-current').textContent = language === 'en' ? 'EN' : '中文';
  for (const option of languageOptions) option.setAttribute('aria-checked', String(option.dataset.lang === language));
  languageMenu.hidden = true;
  languageButton.setAttribute('aria-expanded', 'false');
  window.dispatchEvent(new CustomEvent('rome-language-change', { detail: { language } }));
}

languageButton.addEventListener('click', () => {
  languageMenu.hidden = !languageMenu.hidden;
  languageButton.setAttribute('aria-expanded', String(!languageMenu.hidden));
});
for (const option of languageOptions) option.addEventListener('click', () => applyLanguage(option.dataset.lang));
document.addEventListener('click', (event) => {
  if (!event.target.closest('.rome-language')) {
    languageMenu.hidden = true;
    languageButton.setAttribute('aria-expanded', 'false');
  }
});

const host = document.getElementById('town-game');
const disposeFullscreen=installRomeFullscreen(document,document.getElementById('scene-fullscreen'));
let disposeScene;
window.addEventListener('pagehide', (event) => { if (!event.persisted) { disposeFullscreen(); disposeScene?.(); } });
mountRomeCityScene(host).then((cleanup) => { disposeScene = cleanup; }).catch((error) => {
  console.error(error);
  document.getElementById('town-loading')?.setAttribute('hidden', '');
  document.getElementById('town-error')?.removeAttribute('hidden');
});
