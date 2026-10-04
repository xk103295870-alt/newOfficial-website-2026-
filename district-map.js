'use strict';

// D3 + GeoJSON service-region selector for the Smart District page.
// The glass toggle below the map switches the active region; clicking the
// highlighted map point opens the region's project list, and clicking a
// project opens its detail inside the same popup.
(() => {
  const canvas = document.getElementById('district-map-canvas');
  const svgElement = canvas?.querySelector('.district-map-svg');
  const tooltip = document.getElementById('district-map-tooltip');
  const toggle = document.getElementById('district-glass-toggle');
  if (!canvas || !svgElement || !tooltip || !toggle || !window.d3 || !window.topojson) return;

  const regions = {
    chongqing: {
      zh: '重庆',
      en: 'Chongqing',
      coordinates: [107.8, 29.8],
      color: '#000000',
      projects: {
        'yuedi-shopping-center': {
          logo: '悦',
          logoClass: 'district-project-logo-yuedi',
          zh: ['重庆悦地购物中心', '购物中心 / 会员系统', '重庆 · 商业会员运营', '从支付、积分到权益兑换，建立一体化会员体验。'],
          en: ['Yuedi Shopping Center', 'Shopping center / Membership', 'Chongqing · Membership operations', 'An integrated membership experience connecting payment, points and rewards.'],
        },
        'yunfeng-aishangli': {
          logo: '芸',
          logoClass: 'district-project-logo-yuedi',
          zh: ['重庆芸峰爱尚里购物中心', '购物中心 / 会员系统', '重庆 · 商业会员运营', '从支付、积分到权益兑换，建立一体化会员体验。'],
          en: ['Yunfeng Aishangli Shopping Center', 'Shopping center / Membership', 'Chongqing · Membership operations', 'An integrated membership experience connecting payment, points and rewards.'],
        },
        'jiangjin-meilihui': {
          logo: '江',
          logoClass: 'district-project-logo-yuedi',
          zh: ['江津美邻汇', '商业中心 / 会员运营', '重庆江津 · 商业运营', '面向区域客群，构建易用的会员连接与权益运营体验。'],
          en: ['Jiangjin Meilihui', 'Commercial hub / Membership operations', 'Chongqing Jiangjin · Commercial operations', 'A more accessible membership and rewards experience for the local audience.'],
        },
      },
    },
    sichuan: {
      zh: '四川',
      en: 'Sichuan',
      coordinates: [104.2, 30.5],
      color: '#000000',
      projects: {
        'chengdu-imc': {
          logo: 'I',
          logoClass: 'district-project-logo-yuedi',
          zh: ['成都IMC', '商业项目 / 会员运营', '成都 · 商业会员运营', '围绕会员连接与日常权益，优化商业场景下的连续体验。'],
          en: ['Chengdu IMC', 'Commercial project / Membership operations', 'Chengdu · Membership operations', 'A continuous commerce experience built around membership connection and everyday rewards.'],
        },
        'chengdu-binjiangli': {
          logo: '滨',
          logoClass: 'district-project-logo-yuedi',
          zh: ['成都滨江里', '商业项目 / 数字运营', '成都 · 商业运营', '结合区域消费场景，整理更顺畅的数字触点与会员路径。'],
          en: ['Chengdu Binjiangli', 'Commercial project / Digital operations', 'Chengdu · Commercial operations', 'A smoother digital journey shaped around local commerce scenarios.'],
        },
        'quxian-caifu-center': {
          logo: '渠',
          logoClass: 'district-project-logo-yuedi',
          zh: ['渠县财富中心', '商业综合体 / 会员运营', '四川达州渠县 · 商业运营', '围绕县域商业综合体场景，优化会员连接、权益兑换与日常运营体验。'],
          en: ['Quxian Caifu Center', 'Commercial complex / Membership operations', 'Quxian, Dazhou, Sichuan · Commercial operations', 'A county-level commercial complex experience focused on membership, rewards and everyday operations.'],
        },
      },
    },
    shanxi: {
      zh: '山西',
      en: 'Shanxi',
      coordinates: [112.2, 37.7],
      color: '#000000',
      projects: {
        'shuoshui-town': {
          logo: '涑',
          logoClass: 'district-project-logo-yuedi',
          zh: ['山西涑水小镇', '文旅商业 / 数字体验', '山西 · 文旅商业', '以文化街区与消费场景为基础，提升区域数字体验与运营效率。'],
          en: ['Shuoshui Town', 'Cultural retail / Digital experience', 'Shanxi · Cultural commerce', 'A regional digital experience designed for cultural districts and everyday commerce.'],
        },
        'linyi-nanfeng-department-store': {
          logo: '南',
          logoClass: 'district-project-logo-yuedi',
          zh: ['临猗县南风百货', '百货 / 门店数字化', '山西临猗 · 门店运营', '围绕百货门店的数字化流程，优化会员触达与日常运营。'],
          en: ['Nanfeng Department Store, Linyi County', 'Department store / Retail digitalization', 'Linyi County, Shanxi · Store operations', 'Digital workflows that improve membership touchpoints and daily store operations.'],
        },
        'wenxi-haitian-nanfeng-department-store': {
          logo: '海',
          logoClass: 'district-project-logo-yuedi',
          zh: ['闻喜县海天南风百货', '百货 / 门店数字化', '山西闻喜 · 门店运营', '结合百货运营节奏，搭建更清晰的会员体系与服务流程。'],
          en: ['Haitian Nanfeng Department Store, Wenxi County', 'Department store / Retail digitalization', 'Wenxi County, Shanxi · Store operations', 'A clearer membership and service flow built around department store operations.'],
        },
      },
    },
    zhejiang: {
      zh: '浙江',
      en: 'Zhejiang',
      coordinates: [120.15, 29.2],
      color: '#000000',
      projects: {
        'suichang-lingyue-plaza': {
          logo: '遂',
          logoClass: 'district-project-logo-yuedi',
          zh: ['遂昌领悦广场', '商业广场 / 会员运营', '浙江遂昌 · 商业运营', '针对县域商业场景，提供更贴近用户习惯的会员连接与活动运营。'],
          en: ['Suichang Lingyue Plaza', 'Commercial plaza / Membership operations', 'Suichang, Zhejiang · Commercial operations', 'Membership engagement and campaign operations tailored to county-level commerce.'],
        },
      },
    },
  };

  const toggleThumb = toggle.querySelector('.district-glass-toggle-thumb');
  const regionTabs = [...toggle.querySelectorAll('.district-glass-toggle-option')];
  const projectItems = document.querySelector('.district-project-items');
  const emptyNote = document.querySelector('.district-region-empty');
  const projectListLabel = document.querySelector('.district-project-list-label');
  let language = document.documentElement.lang === 'en' ? 'en' : 'zh';
  let activeRegion = 'chongqing';
  let activeProject = null;
  let tooltipMode = null; // 'region' | 'project'

  function moveToggleThumb() {
    if (!toggleThumb) return;
    const active = regionTabs.find(tab => tab.dataset.region === activeRegion);
    if (!active) return;
    toggleThumb.style.width = `${active.offsetWidth}px`;
    toggleThumb.style.transform = `translateX(${active.offsetLeft}px)`;
  }

  function renderProjects() {
    if (!projectItems || !emptyNote) return;
    projectItems.innerHTML = '';
    const region = regions[activeRegion];
    const entries = Object.entries(region?.projects || {});
    emptyNote.hidden = entries.length > 0;
    if (projectListLabel) projectListLabel.textContent = language === 'en' ? 'PROJECTS' : '区域项目';
    entries.forEach(([key, project]) => {
      const button = document.createElement('button');
      button.className = 'district-project-item';
      button.type = 'button';
      button.setAttribute('aria-selected', String(key === activeProject));
      const copy = document.createElement('span');
      copy.className = 'district-project-copy';
      const title = document.createElement('strong');
      title.textContent = project[language][0];
      const category = document.createElement('small');
      category.textContent = project[language][1];
      copy.append(title, category);
      const arrow = document.createElement('span');
      arrow.className = 'district-project-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';
      button.append(copy, arrow);
      button.addEventListener('click', () => showProjectTooltip(key));
      projectItems.append(button);
    });
  }

  function tooltipShell() {
    tooltip.innerHTML = '';
    const close = document.createElement('button');
    close.className = 'district-map-tooltip-close';
    close.type = 'button';
    close.setAttribute('aria-label', language === 'en' ? 'Close' : '关闭');
    close.textContent = '×';
    close.addEventListener('click', hideTooltip);
    tooltip.append(close);
  }

  function positionTooltip(point) {
    const bounds = canvas.getBoundingClientRect();
    tooltip.hidden = false;
    const width = tooltip.offsetWidth;
    const height = tooltip.offsetHeight;
    const x = Math.min(Math.max(point[0] + 18, 18), Math.max(18, bounds.width - width - 18));
    const y = Math.min(Math.max(point[1] - 18, 18), Math.max(18, bounds.height - height - 18));
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
  }

  function showRegionTooltip() {
    const region = regions[activeRegion];
    const projection = svgElement.__districtMapProjection;
    if (!region || !projection) return;
    tooltipMode = 'region';
    activeProject = null;
    renderProjects();
    tooltipShell();
    const kicker = document.createElement('span');
    kicker.className = 'district-map-tooltip-kicker';
    kicker.textContent = language === 'en' ? 'REGION PROJECTS' : '区域项目';
    const title = document.createElement('h3');
    title.textContent = region[language];
    const list = document.createElement('div');
    list.className = 'district-map-tooltip-projects';
    Object.entries(region.projects || {}).forEach(([key, project]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.project = key;
      const copy = document.createElement('span');
      copy.className = 'district-map-tooltip-project-copy';
      const strong = document.createElement('strong');
      strong.textContent = project[language][0];
      const small = document.createElement('small');
      small.textContent = project[language][1];
      copy.append(strong, small);
      const arrow = document.createElement('span');
      arrow.className = 'district-map-tooltip-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';
      button.append(copy, arrow);
      button.addEventListener('click', () => showProjectTooltip(key));
      list.append(button);
    });
    tooltip.append(kicker, title, list);
    positionTooltip(projection(region.coordinates));
  }

  function hideTooltip() {
    tooltip.hidden = true;
    tooltipMode = null;
    activeProject = null;
  }

  function showProjectTooltip(projectKey) {
    const region = regions[activeRegion];
    const project = region?.projects?.[projectKey];
    const projection = svgElement.__districtMapProjection;
    if (!region || !project || !projection) return;
    tooltipMode = 'project';
    activeProject = projectKey;
    renderProjects();
    tooltipShell();
    const back = document.createElement('button');
    back.className = 'district-map-tooltip-back';
    back.type = 'button';
    back.textContent = language === 'en' ? '← All projects' : '← 全部项目';
    back.addEventListener('click', showRegionTooltip);
    const content = project[language];
    const kicker = document.createElement('span');
    kicker.className = 'district-map-tooltip-kicker';
    kicker.textContent = content[1];
    const title = document.createElement('h3');
    title.textContent = content[0];
    const copy = document.createElement('p');
    copy.textContent = content[3];
    const meta = document.createElement('span');
    meta.className = 'district-map-tooltip-meta';
    meta.textContent = content[2];
    tooltip.append(back, kicker, title, copy, meta);
    positionTooltip(projection(region.coordinates));
  }

  function drawMap(geojson) {
    const width = Math.max(320, canvas.clientWidth);
    const height = Math.max(360, canvas.clientHeight);
    const svg = d3.select(svgElement);
    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    const defs = svg.append('defs');
    const clipId = `district-map-clip-${Date.now()}`;
    defs.append('clipPath').attr('id', clipId).append('rect').attr('width', width).attr('height', height).attr('rx', 4);

    const mapGroup = svg.append('g').attr('clip-path', `url(#${clipId})`);
    mapGroup.append('rect').attr('width', width).attr('height', height).attr('fill', '#ffffff');
    const chinaRegion = {
      type: 'FeatureCollection',
      features: geojson.features.filter(feature => {
        const [longitude, latitude] = d3.geoCentroid(feature);
        return longitude > 70 && longitude < 145 && latitude > 15 && latitude < 58;
      }),
    };
    const projection = d3.geoMercator().fitExtent([[width * .14, height * .1], [width * .86, height * .9]], chinaRegion);
    const path = d3.geoPath(projection);

    const graticule = d3.geoGraticule().step([15, 10]);
    mapGroup.append('path').datum(graticule()).attr('class', 'district-map-graticule').attr('d', path);
    mapGroup.append('g').attr('class', 'district-map-land').selectAll('path').data(chinaRegion.features).join('path').attr('d', path);
    mapGroup.append('g').attr('class', 'district-map-coast').selectAll('path').data(chinaRegion.features).join('path').attr('d', path).attr('fill', 'none');

    const regionLayer = mapGroup.append('g').attr('class', 'district-map-regions');
    Object.entries(regions).forEach(([key, region]) => {
      const point = projection(region.coordinates);
      const group = regionLayer.append('g').attr('class', `district-map-region${key === activeRegion ? ' is-selected' : ''}`).attr('data-region', key).attr('transform', `translate(${point[0]},${point[1]})`);
      group.append('circle').attr('class', 'district-map-hit').attr('r', 16).attr('fill', 'transparent');
      group.append('circle').attr('class', 'district-map-pulse').attr('r', 17).attr('stroke', region.color).attr('pointer-events', 'none');
      group.append('circle').attr('class', 'district-map-dot').attr('r', 5).attr('fill', region.color).attr('pointer-events', 'none');
      group.style('cursor', 'pointer').on('click', () => {
        if (key !== activeRegion) setActiveRegion(key);
        showRegionTooltip();
      });
    });

    svgElement.__districtMapProjection = projection;
    svgElement.__districtMapGeojson = geojson;
  }

  function setActiveRegion(regionKey) {
    activeRegion = regionKey;
    activeProject = null;
    regionTabs.forEach(tab => tab.setAttribute('aria-selected', String(tab.dataset.region === regionKey)));
    hideTooltip();
    moveToggleThumb();
    renderProjects();
    if (svgElement.__districtMapGeojson) drawMap(svgElement.__districtMapGeojson);
  }

  regionTabs.forEach(tab => tab.addEventListener('click', () => setActiveRegion(tab.dataset.region)));
  document.addEventListener('wntc:language', event => {
    language = event.detail;
    regionTabs.forEach(tab => { tab.textContent = regions[tab.dataset.region][language]; });
    requestAnimationFrame(moveToggleThumb);
    renderProjects();
    if (tooltipMode === 'project' && activeProject) showProjectTooltip(activeProject);
    else if (tooltipMode === 'region') showRegionTooltip();
  });
  window.addEventListener('resize', moveToggleThumb);
  window.addEventListener('load', moveToggleThumb);
  requestAnimationFrame(moveToggleThumb);

  async function loadMap() {
    try {
      const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
      const all = topojson.feature(world, world.objects.countries);
      const asia = all.features.filter(feature => {
        const [longitude, latitude] = d3.geoCentroid(feature);
        return longitude > 20 && longitude < 155 && latitude > -12 && latitude < 78;
      });
      drawMap({ type: 'FeatureCollection', features: asia });
      renderProjects();
      new ResizeObserver(() => drawMap({ type: 'FeatureCollection', features: asia })).observe(canvas);
    } catch (error) {
      canvas.classList.add('is-unavailable');
      const notice = document.createElement('p');
      notice.className = 'district-map-fallback';
      notice.textContent = language === 'en' ? 'Map data is loading. Please refresh when online.' : '地图数据正在加载，请联网后刷新。';
      canvas.append(notice);
      renderProjects();
      console.warn('WNTC region map unavailable', error);
    }
  }

  loadMap();
})();
