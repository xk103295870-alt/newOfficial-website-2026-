'use strict';

// Translations are authored locally in HTML; the hero and artwork remain in English.
const translations = [...document.querySelectorAll('[data-en]')].map(element => ({
  element, zh: element.innerHTML, en: element.dataset.en,
}));
const labels = [...document.querySelectorAll('[data-en-label]')].map(element => ({
  element, zh: element.getAttribute('aria-label'), en: element.dataset.enLabel,
}));
const isDistrict = document.body.dataset.page === 'district';
const isBI = document.body.dataset.page === 'bi';
const isUIDesign = document.body.dataset.page === 'ui';
const isUICase = document.body.dataset.page === 'ui-case';
const isRome = document.body.dataset.page === 'rome';
const isVietnam = document.body.dataset.page === 'vietnam';
const isAILab = document.body.dataset.page === 'ai';
const titles = isUICase ? {zh:'UI设计 — WNTC',en:'UI Design — WNTC'} : isRome ? {zh:'罗马线稿城市 — WNTC AI创意实验',en:'Rome Line City — WNTC AI Creative Lab'} : isVietnam ? {zh:'越南旅行手绘册 — WNTC AI创意实验',en:'Vietnam Travel Sketchbook — WNTC AI Creative Lab'} : isAILab ? {zh:'AI创意实验室 — WNTC',en:'AI Creative Lab — WNTC'} : isUIDesign ? {zh:'工作室独立项目 · PHOTO ($) — WNTC',en:'Independent Studio Project · PHOTO ($) — WNTC'} : isBI ? {zh:'商业智能 — WNTC', en:'Business Intelligence — WNTC'} : isDistrict ? {zh:'智慧商圈会员系统 — WNTC', en:'Smart District Membership System — WNTC'} : { zh: 'WNTC — 设计与技术', en: 'WNTC — Design & Technology' };
const descriptions = isUICase ? {zh:'WNTC UI设计案例：视觉方向、界面系统与响应式体验。',en:'WNTC UI design case: visual direction, interface systems and responsive experience.'} : isRome ? {zh:'WNTC 罗马线稿城市：黑白灰线稿中的古罗马全城。斗兽场、大竞技场、广场与台伯河，由 Three.js 实时绘制。',en:'WNTC Rome Line City: a sprawling monochrome city inspired by imperial Rome — the Colosseum, Circus Maximus, forum and the Tiber, rendered live with Three.js.'} : isVietnam ? {zh:'WNTC 越南旅行手绘册：跨页画面、原片对照与交互折页。由真实旅行照片转绘的 AI 插画，与原片一起翻阅。',en:'An interactive Vietnam travel sketchbook with page folds and original-photo reference. AI illustrations reimagined from original trip photographs.'} : isAILab ? {zh:'WNTC AI创意实验室：生成式系统、创意编程与人机协作的持续探索。',en:'WNTC AI Creative Lab: ongoing experiments in generative systems, creative coding and human–AI collaboration.'} : isUIDesign ? {zh:'WNTC 工作室独立项目：PHOTO ($) 旅行摄影网站的影像编排、视觉探索与网站体验。',en:'WNTC independent studio project: an exploration of image direction, visual language and web experience for PHOTO ($).'} : isBI ? {zh:'商业智能：面向购物中心与连锁门店的经营数据分析与可视化。',en:'Business Intelligence: business analytics and data visualization for shopping centers and chain stores.'} : isDistrict ? {zh:'智慧商圈会员系统：连接支付、积分、会员与停车权益的数字化运营方案。',en:'Smart District Membership System: connect payments, points, membership and parking rewards in one CRM solution.'} : {
  zh: 'WNTC 是一家设计与技术工作室，我们打造数字产品与品牌。',
  en: 'WNTC is an independent design and technology studio crafting digital products and brands.',
};
let currentLang = 'zh';
const languageButton = document.getElementById('lang-toggle');
const languageMenu = document.getElementById('lang-menu');
const languageOptions = [...languageMenu.querySelectorAll('[data-lang]')];
const menuButton = document.getElementById('menu-toggle');
const navigation = document.getElementById('primary-nav');
const dialog = document.getElementById('project-dialog');
let activeProject = null;

function setLanguage(lang) {
  if (!(lang in titles)) return;
  currentLang = lang;
  translations.forEach(({ element, ...text }) => { element.innerHTML = text[lang]; });
  labels.forEach(({ element, ...text }) => { element.setAttribute('aria-label', text[lang]); });
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
  document.title = titles[lang];
  document.querySelector('meta[name="description"]').content = descriptions[lang];
  document.getElementById('lang-current').textContent = lang === 'en' ? 'EN' : '中文';
  languageOptions.forEach(option => option.setAttribute('aria-checked', String(option.dataset.lang === lang)));
  if (activeProject) renderProject(activeProject);
  try { localStorage.setItem('wntc-lang', lang); } catch { /* Storage may be disabled. */ }
  document.dispatchEvent(new CustomEvent('wntc:language', { detail: lang }));
}
function closeLanguage(restoreFocus = false) {
  languageMenu.hidden = true;
  languageButton.setAttribute('aria-expanded', 'false');
  if (restoreFocus) languageButton.focus();
}
function closeNavigation(restoreFocus = false) {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  if (restoreFocus) menuButton.focus();
}
function openLanguage() {
  closeNavigation();
  languageMenu.hidden = false;
  languageButton.setAttribute('aria-expanded', 'true');
  languageOptions.find(option => option.dataset.lang === currentLang).focus();
}
languageButton.addEventListener('click', () => languageMenu.hidden ? openLanguage() : closeLanguage());
languageButton.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); openLanguage(); }
});
languageOptions.forEach(option => option.addEventListener('click', () => {
  setLanguage(option.dataset.lang);
  closeLanguage(true);
}));
languageMenu.addEventListener('keydown', event => {
  const index = languageOptions.indexOf(document.activeElement);
  if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? languageOptions.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + languageOptions.length) % languageOptions.length;
    languageOptions[next].focus();
  }
});
menuButton.addEventListener('click', () => {
  closeLanguage();
  const open = navigation.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(open));
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeNavigation()));
document.addEventListener('click', event => {
  if (!event.target.closest('.lang-switch')) closeLanguage();
  if (!navigation.contains(event.target) && !menuButton.contains(event.target)) closeNavigation();
});
document.addEventListener('focusin', event => {
  if (!event.target.closest('.lang-switch')) closeLanguage();
  if (!navigation.contains(event.target) && !menuButton.contains(event.target)) closeNavigation();
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (!languageMenu.hidden) closeLanguage(true);
  if (navigation.classList.contains('is-open')) closeNavigation(true);
});
window.matchMedia('(max-width:1000px)').addEventListener('change', () => closeNavigation());

const projects = {
  commerce: {
    zh: ['序光电商', '围绕少而精的生活物件，探索更克制的电商表达。通过大幅排版、产品轮廓与充足留白，让物件的形态成为视觉中心。', '品牌识别 / 电商体验'],
    en: ['Xuguang Commerce', 'A restrained commerce concept for thoughtfully selected objects. Large typography, a sculptural product silhouette and generous space put form at the center of the experience.', 'Brand identity / Commerce'],
  },
  ui: {
    zh: ['工作室独立项目 · PHOTO ($)', 'PHOTO ($) 是 WNTC 工作室自主发起的旅行摄影网站项目。以摄影作品为视觉中心，结合大幅字体、错落图片与留白，探索品牌表达、内容编排与网站体验。', '独立策划 / 视觉设计 / 网站体验'],
    en: ['Independent Studio Project · PHOTO ($)', 'PHOTO ($) is a self-initiated WNTC studio project for a travel photography website. Large typography, offset photography and generous whitespace explore brand expression, editorial structure and web experience.', 'Self-initiated / Visual design / Web experience'],
  },
  travel: {
    zh: ['无垠文旅', '把旅程理解为不断扩展的视野，以轨迹与边界为线索，探索旅行品牌、生成式内容与个性化体验的结合。', '创意技术 / 人工智能'],
    en: ['Wuyin Travel', 'A journey as an expanding perspective. Paths and boundaries form the starting point for exploring travel identity, generative content and personalized experiences.', 'Creative technology / AI'],
  },
  'brand-ui': {
    zh: ['UI设计', '以任务管理界面为主题的临时设计示意，展示桌面端与移动端的视觉配合、信息层级和组件排版。正式案例资料确定后替换。', '界面视觉 / 组件设计 / 响应式布局'],
    en: ['UI Design', 'A provisional task-management interface study exploring desktop and mobile layouts, information hierarchy and component design. To be replaced with the final case materials.', 'UI design / Components / Responsive layouts'],
  },
};
function renderProject(key) {
  const [title, description, scope] = projects[key][currentLang];
  const isUI = key === 'ui' || key === 'brand-ui';
  document.getElementById('project-image').hidden = !isUI;
  const english = currentLang === 'en';
  const preview = document.getElementById('project-image');
  preview.src = key === 'brand-ui' ? 'assets/ui-design-generated.jpg' : 'assets/旅行拍摄封面.jpg';
  preview.alt = key === 'brand-ui' ? (english ? 'UI design studio project cover' : 'UI设计工作室项目封面') : (english ? 'PHOTO ($) independent studio project cover' : 'PHOTO ($) 工作室独立项目封面');
  preview.width = key === 'brand-ui' ? 1200 : 1000;
  preview.height = key === 'brand-ui' ? 1600 : 1250;
  document.getElementById('project-kind').textContent = key === 'brand-ui' ? (english ? 'WNTC / STUDIO CASE' : 'WNTC / 工作室案例') : (key === 'ui' ? (english ? 'WNTC / INDEPENDENT STUDIO PROJECT' : 'WNTC / 工作室独立项目') : (isUI ? (english ? 'WNTC / WEBSITE CASE' : 'WNTC / 网站案例') : (english ? 'INDEPENDENT CONCEPT' : '独立概念作品')));
  document.getElementById('project-scope-label').textContent = isUI ? (english ? 'SCOPE OF WORK' : '工作内容') : (english ? 'EXPLORATION' : '探索方向');
  document.getElementById('project-note').textContent = key === 'brand-ui' ? (english ? 'A studio design case presentation. The cover is a visual direction sample for the UI case.' : '工作室设计案例展示，当前封面为 UI 设计方向示意图。') : (key === 'ui' ? (english ? 'A self-initiated WNTC studio project, developed as an independent exploration of travel photography and web experience.' : 'WNTC 工作室自主发起的独立项目，用于探索旅行摄影与网站体验的结合。') : (isUI ? (english ? 'Cover composed from the original project photography; this is an editorial case presentation, not a page screenshot.' : '封面使用原项目摄影素材重新编排，为案例展示图，非网页原始截图。') : (english ? 'A self-initiated concept, not a commissioned client project.' : '自主概念探索，非客户委托项目。')));
  document.getElementById('project-title').textContent = title;
  document.getElementById('project-description').textContent = description;
  document.getElementById('project-scope').textContent = scope;
}
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  activeProject = button.dataset.project;
  renderProject(activeProject);
  dialog.showModal();
  document.body.classList.add('modal-open');
}));
dialog?.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog?.querySelector('a').addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog?.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  activeProject = null;
});

// Use actual section positions, so there is no falsely selected navigation item on the hero.
const sectionLinks = [...navigation.querySelectorAll('a')].filter(link => link.getAttribute('href').startsWith('#'));
const sections = sectionLinks.map(link => document.querySelector(link.hash));
let scrollQueued = false;
function updateNavigation() {
  let current = null;
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= window.innerHeight * .4 && rect.bottom > 100) current = section.id;
  });
  sectionLinks.forEach(link => {
    if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollQueued = false;
}
window.addEventListener('scroll', () => {
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateNavigation); }
}, { passive:true });
window.addEventListener('resize', updateNavigation);
let savedLanguage;
try { savedLanguage = localStorage.getItem('wntc-lang'); } catch { /* Defaults to Chinese. */ }
setLanguage(savedLanguage === 'en' ? 'en' : 'zh');
document.getElementById('year').textContent = new Date().getFullYear();
updateNavigation();
