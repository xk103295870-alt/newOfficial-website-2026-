# Smart Business Bilingual Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 `smart-business-district.html` 增加仅限该页面的中英文双语切换。

**Architecture:** 在单个静态 HTML 文件内实现语言切换：给现有中文文案增加 `data-i18n` key，增加页面内 `translations` 字典和 `setSmartBusinessLanguage(lang)` 函数。顶部导航右侧新增 `中 / EN` 按钮，保留原有链接、主题切换和滚动交互。

**Tech Stack:** 原生 HTML、CSS、JavaScript、Chrome 本地 file:// 预览。

---

## File Structure

- Modify: `smart-business-district.html`
  - Responsibility: 页面结构、样式、中文/英文文案字典、语言切换逻辑全部在当前文件内完成。

---

### Task 1: Add language switcher styling

**Files:**
- Modify: `smart-business-district.html`

- [ ] **Step 1: Add CSS after `.nav-login::after` rule**

Insert this CSS after the existing line `.nav-login::after { display: none !important; }`:

```css
  .lang-switcher {
    display: inline-flex;
    align-items: center;
    gap: 0;
    margin-left: 16px;
    border: var(--hair) solid var(--c-border);
    height: 32px;
  }
  .lang-btn {
    height: 30px;
    min-width: 40px;
    padding: 0 10px;
    border: 0;
    background: transparent;
    color: var(--c-muted);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    cursor: pointer;
  }
  .lang-btn + .lang-btn { border-left: var(--hair) solid var(--c-border); }
  .lang-btn.active { background: var(--accent); color: #000; }
```

- [ ] **Step 2: Verify CSS location**

Confirm the inserted CSS is still inside the `<style>` block and before the `/* ── HERO ── */` comment.

---

### Task 2: Add i18n markers and language buttons

**Files:**
- Modify: `smart-business-district.html`

- [ ] **Step 1: Replace nav block**

Replace lines containing the current nav content:

```html
    <div class="lp-nav-left">
      <a href="index.html" class="lp-wordmark">W工作室</a>
      <span class="lp-version">[1.0.0]</span>
    </div>
    <div class="lp-nav-right">
      <a href="#features">产品</a>
      <a href="#features">功能</a>
      <a href="#steps">接入</a>
      <a href="./docs/index.html">文档</a>
      <a href="#cta">联系</a>
    </div>
    <a href="http://admin.mall.alipayjf.com/login?redirect=%2Findex" target="_blank" class="nav-login">商家登陆</a>
```

with:

```html
    <div class="lp-nav-left">
      <a href="index.html" class="lp-wordmark" data-i18n="brand">W工作室</a>
      <span class="lp-version">[1.0.0]</span>
    </div>
    <div class="lp-nav-right">
      <a href="#features" data-i18n="nav.product">产品</a>
      <a href="#features" data-i18n="nav.features">功能</a>
      <a href="#steps" data-i18n="nav.access">接入</a>
      <a href="./docs/index.html" data-i18n="nav.docs">文档</a>
      <a href="#cta" data-i18n="nav.contact">联系</a>
    </div>
    <a href="http://admin.mall.alipayjf.com/login?redirect=%2Findex" target="_blank" class="nav-login" data-i18n="nav.login">商家登陆</a>
    <div class="lang-switcher" aria-label="语言切换">
      <button class="lang-btn active" data-lang="zh" type="button">中</button>
      <button class="lang-btn" data-lang="en" type="button">EN</button>
    </div>
```

- [ ] **Step 2: Add i18n markers to hero**

Update the hero section so these elements include exactly these keys:

```html
<span data-i18n="hero.eyebrow">智慧商圈 · 数字化CRM</span>
<h1 class="hero-title" data-i18n="hero.title">支付即积分<br>会员即资产</h1>
<p class="hero-sub" data-i18n="hero.subtitle">
  为购物中心、百货商场、商业街区、交通枢纽商业打造全渠道营销服务数智中台。
  <span class="muted">整合微信支付、支付宝、美团以及抖音等数据，建立商圈独立会员数据库，实现精准定向营销。</span>
</p>
```

Add these keys to the stat labels:

```html
<div class="lbl" data-i18n="hero.stat.projects">合作商业地产项目</div>
<div class="lbl" data-i18n="hero.stat.members">会员数据</div>
<div class="lbl" data-i18n="hero.stat.parking">合作停车系统商</div>
```

- [ ] **Step 3: Add i18n markers to content sections**

Add `data-i18n` attributes to the existing Chinese text elements using these exact mappings:

```text
problem.heading -> [ 行业痛点 ]
problem.subtitle -> 为什么传统会员运营失效
problem.member.title -> 会员权益体验差
problem.member.item1 -> 积分叠加流程复杂，消费者操作门槛高
problem.member.item2 -> 活动触达率低，消费者无体感
problem.member.item3 -> 积分商品无吸引力，兑换意愿低
problem.execution.title -> 落地执行难
problem.execution.item1 -> 工作流程繁琐，商管运营要求高
problem.execution.item2 -> 商家配合度低，推广阻力大
problem.execution.item3 -> 硬件成本高，IT改造周期长
solution.heading -> [ 核心方案 ]
solution.subtitle -> 0成本接入 · 当天见效
solution.title -> 商圈独立会员数据库
solution.desc -> 微信支付和支付宝针对商圈推出「支付即积分」功能，无需对现场商家做任何软硬件改造，通过支付数据回传实现积分自动叠加。我们建立商圈独立会员数据库，将两端的会员数据统一汇总，打破数据孤岛，实现真正的全渠道会员运营。
solution.flow1.num -> [01] 常规券法统
solution.flow1.title -> 全场券 / 组合券 / 单品券
solution.flow1.desc -> 标准化券体系搭建，覆盖场内全业态，快速建立营销抓手。
solution.flow2.num -> [02] 打通停车系统
solution.flow2.title -> 积分兑换停车券 / 在线支付
solution.flow2.desc -> 会员可线上消耗兑换停车券和在线支付，完成整个积分获取和消耗的完整闭环。
solution.flow3.num -> [03] 深度运营
solution.flow3.title -> 会员画像 / 二次营销
solution.flow3.desc -> 分析消费频次、金额等数据，做会员营销的深度运营，提升复购。
features.heading -> [ 产品功能 ]
features.subtitle -> 全渠道营销服务数智中台
features.store.title -> 靓装店铺 & 积分商城
features.store.desc -> 模块化灵活调整，头图轮播吸睛，主页展示模块化搭配。积分商城支持星巴克代金券、饿了么红包、天猫满减券、停车权益等。
features.store.tag -> 60%积分用于停车
features.parking.title -> 主流停车系统适配
features.parking.desc -> 包含科拓、立方、宜泊等主流停车系统，提升会员消费粘性。
features.parking.tag -> 主流系统支持
features.marketing.title -> 营销中心 & 互动玩法
features.marketing.desc -> 会员专享券、生日礼、众筹游戏、垃圾回收打卡、周年庆集字领红包、直播带货，全渠道营销工具一站搞定。
features.marketing.tag -> 可配置
features.data.title -> 会员数据 & 效果复盘
features.data.desc -> 会员数据支持活动复盘和效果反馈，消费频次、金额、偏好一目了然，用数据驱动营销决策。
features.data.tag -> 实时数据
steps.heading -> [ 接入流程 ]
steps.subtitle -> 一般1周左右 · 0成本接入
steps.step1.title -> 开通主体
steps.step1.desc -> 配置微信小程序账户、微信支付及支付宝账户，服务中台配合甲方收集资料与账号申请。
steps.step1.hint -> 周期: <span class="tag">2-3 天</span>
steps.step2.title -> 数据对接
steps.step2.desc -> 以0成本接入为主，对接支付数据回传接口，建立商圈独立会员数据库，无需改造商家软硬件。
steps.step2.hint -> 周期: <span class="tag">3-4 天</span>
steps.step3.title -> 上线运营
steps.step3.desc -> 配置营销活动、积分规则、停车权益等，启动支付即积分，24×7远程或现场服务保障。
steps.step3.hint -> 周期: <span class="tag">持续</span>
cta.title -> 让商圈会员数据<br>成为你的资产。
cta.subtitle -> 留下需求，我们会在 24 小时内与你对齐智慧商圈方案。
cta.email -> 邮件咨询
cta.wecom -> 企业微信
footer.brand -> W工作室 [v1.0]
footer.product -> 产品
footer.process -> 流程
footer.contact -> 联系
footer.email -> 邮件
footer.copyright -> © 2026 微诺技术工作室 · weinuo.work
```

---

### Task 3: Add translations and language switching script

**Files:**
- Modify: `smart-business-district.html`

- [ ] **Step 1: Insert translations before `// Smooth scroll`**

Insert this JavaScript after the saved theme block and before the `// Smooth scroll` comment:

```js
  // Language switcher
  const translations = {
    zh: {
      'brand': 'W工作室',
      'nav.product': '产品',
      'nav.features': '功能',
      'nav.access': '接入',
      'nav.docs': '文档',
      'nav.contact': '联系',
      'nav.login': '商家登陆',
      'hero.eyebrow': '智慧商圈 · 数字化CRM',
      'hero.title': '支付即积分<br>会员即资产',
      'hero.subtitle': '为购物中心、百货商场、商业街区、交通枢纽商业打造全渠道营销服务数智中台。<span class="muted">整合微信支付、支付宝、美团以及抖音等数据，建立商圈独立会员数据库，实现精准定向营销。</span>',
      'hero.stat.projects': '合作商业地产项目',
      'hero.stat.members': '会员数据',
      'hero.stat.parking': '合作停车系统商',
      'problem.heading': '[ 行业痛点 ]',
      'problem.subtitle': '为什么传统会员运营失效',
      'problem.member.title': '会员权益体验差',
      'problem.member.item1': '积分叠加流程复杂，消费者操作门槛高',
      'problem.member.item2': '活动触达率低，消费者无体感',
      'problem.member.item3': '积分商品无吸引力，兑换意愿低',
      'problem.execution.title': '落地执行难',
      'problem.execution.item1': '工作流程繁琐，商管运营要求高',
      'problem.execution.item2': '商家配合度低，推广阻力大',
      'problem.execution.item3': '硬件成本高，IT改造周期长',
      'solution.heading': '[ 核心方案 ]',
      'solution.subtitle': '0成本接入 · 当天见效',
      'solution.title': '商圈独立会员数据库',
      'solution.desc': '微信支付和支付宝针对商圈推出「支付即积分」功能，无需对现场商家做任何软硬件改造，通过支付数据回传实现积分自动叠加。我们建立商圈独立会员数据库，将两端的会员数据统一汇总，打破数据孤岛，实现真正的全渠道会员运营。',
      'solution.flow1.num': '[01] 常规券法统',
      'solution.flow1.title': '全场券 / 组合券 / 单品券',
      'solution.flow1.desc': '标准化券体系搭建，覆盖场内全业态，快速建立营销抓手。',
      'solution.flow2.num': '[02] 打通停车系统',
      'solution.flow2.title': '积分兑换停车券 / 在线支付',
      'solution.flow2.desc': '会员可线上消耗兑换停车券和在线支付，完成整个积分获取和消耗的完整闭环。',
      'solution.flow3.num': '[03] 深度运营',
      'solution.flow3.title': '会员画像 / 二次营销',
      'solution.flow3.desc': '分析消费频次、金额等数据，做会员营销的深度运营，提升复购。',
      'features.heading': '[ 产品功能 ]',
      'features.subtitle': '全渠道营销服务数智中台',
      'features.store.title': '靓装店铺 & 积分商城',
      'features.store.desc': '模块化灵活调整，头图轮播吸睛，主页展示模块化搭配。积分商城支持星巴克代金券、饿了么红包、天猫满减券、停车权益等。',
      'features.store.tag': '60%积分用于停车',
      'features.parking.title': '主流停车系统适配',
      'features.parking.desc': '包含科拓、立方、宜泊等主流停车系统，提升会员消费粘性。',
      'features.parking.tag': '主流系统支持',
      'features.marketing.title': '营销中心 & 互动玩法',
      'features.marketing.desc': '会员专享券、生日礼、众筹游戏、垃圾回收打卡、周年庆集字领红包、直播带货，全渠道营销工具一站搞定。',
      'features.marketing.tag': '可配置',
      'features.data.title': '会员数据 & 效果复盘',
      'features.data.desc': '会员数据支持活动复盘和效果反馈，消费频次、金额、偏好一目了然，用数据驱动营销决策。',
      'features.data.tag': '实时数据',
      'steps.heading': '[ 接入流程 ]',
      'steps.subtitle': '一般1周左右 · 0成本接入',
      'steps.step1.title': '开通主体',
      'steps.step1.desc': '配置微信小程序账户、微信支付及支付宝账户，服务中台配合甲方收集资料与账号申请。',
      'steps.step1.hint': '周期: <span class="tag">2-3 天</span>',
      'steps.step2.title': '数据对接',
      'steps.step2.desc': '以0成本接入为主，对接支付数据回传接口，建立商圈独立会员数据库，无需改造商家软硬件。',
      'steps.step2.hint': '周期: <span class="tag">3-4 天</span>',
      'steps.step3.title': '上线运营',
      'steps.step3.desc': '配置营销活动、积分规则、停车权益等，启动支付即积分，24×7远程或现场服务保障。',
      'steps.step3.hint': '周期: <span class="tag">持续</span>',
      'cta.title': '让商圈会员数据<br>成为你的资产。',
      'cta.subtitle': '留下需求，我们会在 24 小时内与你对齐智慧商圈方案。',
      'cta.email': '邮件咨询',
      'cta.wecom': '企业微信',
      'footer.brand': 'W工作室 [v1.0]',
      'footer.product': '产品',
      'footer.process': '流程',
      'footer.contact': '联系',
      'footer.email': '邮件',
      'footer.copyright': '© 2026 微诺技术工作室 · weinuo.work'
    },
    en: {
      'brand': 'W Studio',
      'nav.product': 'Product',
      'nav.features': 'Features',
      'nav.access': 'Access',
      'nav.docs': 'Docs',
      'nav.contact': 'Contact',
      'nav.login': 'Merchant Login',
      'hero.eyebrow': 'Smart Business District · Digital CRM',
      'hero.title': 'Pay to Earn Points<br>Members Become Assets',
      'hero.subtitle': 'Build an omnichannel marketing and digital operation platform for shopping centers, department stores, commercial streets, and transit retail spaces.<span class="muted">Integrate payment and transaction data from WeChat Pay, Alipay, Meituan, Douyin, and more to create an independent member database for precise targeted marketing.</span>',
      'hero.stat.projects': 'Commercial real estate projects',
      'hero.stat.members': 'Member records',
      'hero.stat.parking': 'Parking system partners',
      'problem.heading': '[ Industry Pain Points ]',
      'problem.subtitle': 'Why traditional member operations fail',
      'problem.member.title': 'Poor member experience',
      'problem.member.item1': 'Point accumulation is complicated and hard for consumers to use',
      'problem.member.item2': 'Campaign reach is low and customers barely notice the benefits',
      'problem.member.item3': 'Rewards are unattractive, resulting in low redemption intent',
      'problem.execution.title': 'Difficult execution',
      'problem.execution.item1': 'Workflows are complex and require heavy operation effort',
      'problem.execution.item2': 'Merchant cooperation is weak and promotion faces resistance',
      'problem.execution.item3': 'Hardware costs are high and IT transformation takes too long',
      'solution.heading': '[ Core Solution ]',
      'solution.subtitle': 'Zero-cost access · Effective immediately',
      'solution.title': 'Independent business district member database',
      'solution.desc': 'WeChat Pay and Alipay provide “pay to earn points” capabilities for business districts. No software or hardware changes are required for on-site merchants. Payment data callbacks automatically accumulate points. We build an independent member database for the business district, consolidate member data across channels, break data silos, and enable true omnichannel member operations.',
      'solution.flow1.num': '[01] Standard coupon system',
      'solution.flow1.title': 'Sitewide coupons / Bundle coupons / Item coupons',
      'solution.flow1.desc': 'Build a standardized coupon system covering all business types and quickly create practical marketing tools.',
      'solution.flow2.num': '[02] Connect parking systems',
      'solution.flow2.title': 'Redeem parking coupons / Online payment',
      'solution.flow2.desc': 'Members can redeem parking coupons and pay online, completing the full loop from point earning to point consumption.',
      'solution.flow3.num': '[03] Deep operations',
      'solution.flow3.title': 'Member profiles / Retargeting',
      'solution.flow3.desc': 'Analyze purchase frequency, amount, and behavior data to improve member operations and repeat purchases.',
      'features.heading': '[ Product Features ]',
      'features.subtitle': 'Omnichannel marketing service platform',
      'features.store.title': 'Branded storefront & points mall',
      'features.store.desc': 'Flexible modular layout, attractive banner carousel, and configurable homepage modules. The points mall supports Starbucks vouchers, Ele.me coupons, Tmall discounts, parking benefits, and more.',
      'features.store.tag': '60% of points used for parking',
      'features.parking.title': 'Mainstream parking system integration',
      'features.parking.desc': 'Supports mainstream parking systems such as Keytop, Lifang, and Yibo to improve member engagement.',
      'features.parking.tag': 'Mainstream systems supported',
      'features.marketing.title': 'Marketing center & interactive campaigns',
      'features.marketing.desc': 'Member-only coupons, birthday gifts, crowdfunding games, recycling check-ins, anniversary word-collection red packets, live commerce, and omnichannel campaign tools in one place.',
      'features.marketing.tag': 'Configurable',
      'features.data.title': 'Member data & performance review',
      'features.data.desc': 'Member data supports campaign review and performance feedback. Purchase frequency, amount, and preferences are visible at a glance to drive marketing decisions.',
      'features.data.tag': 'Real-time data',
      'steps.heading': '[ Access Process ]',
      'steps.subtitle': 'About one week · Zero-cost access',
      'steps.step1.title': 'Open accounts',
      'steps.step1.desc': 'Configure WeChat Mini Program, WeChat Pay, and Alipay accounts. The service platform assists the client with document collection and account applications.',
      'steps.step1.hint': 'Cycle: <span class="tag">2-3 days</span>',
      'steps.step2.title': 'Data integration',
      'steps.step2.desc': 'Connect payment data callback interfaces and build an independent member database for the business district without changing merchant software or hardware.',
      'steps.step2.hint': 'Cycle: <span class="tag">3-4 days</span>',
      'steps.step3.title': 'Launch operations',
      'steps.step3.desc': 'Configure campaigns, point rules, parking benefits, and start pay-to-earn-points operations with 24×7 remote or on-site support.',
      'steps.step3.hint': 'Cycle: <span class="tag">Ongoing</span>',
      'cta.title': 'Turn business district member data<br>into your asset.',
      'cta.subtitle': 'Leave your requirements and we will align a smart business district solution with you within 24 hours.',
      'cta.email': 'Email Consultation',
      'cta.wecom': 'WeCom',
      'footer.brand': 'W Studio [v1.0]',
      'footer.product': 'Product',
      'footer.process': 'Process',
      'footer.contact': 'Contact',
      'footer.email': 'Email',
      'footer.copyright': '© 2026 Weinuo Tech Studio · weinuo.work'
    }
  };

  function setSmartBusinessLanguage(lang) {
    const dict = translations[lang] || translations.zh;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (Object.prototype.hasOwnProperty.call(dict, key)) {
        el.innerHTML = dict[key];
      }
    });
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    localStorage.setItem('smartBusinessLang', lang);
  }

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setSmartBusinessLanguage(btn.dataset.lang));
  });

  const savedSmartBusinessLang = localStorage.getItem('smartBusinessLang');
  setSmartBusinessLanguage(savedSmartBusinessLang === 'en' ? 'en' : 'zh');
```

---

### Task 4: Verify in browser

**Files:**
- Verify: `smart-business-district.html`

- [ ] **Step 1: Reload local page**

Open or reload:

```text
file:///Users/xk/CC/newOfficial-website-main/smart-business-district.html
```

Expected: page loads without console errors.

- [ ] **Step 2: Verify default Chinese**

Expected visible text includes:

```text
支付即积分
会员即资产
商家登陆
产品
功能
接入
文档
联系
```

- [ ] **Step 3: Click EN and verify English**

Click the `EN` button.

Expected visible text includes:

```text
Pay to Earn Points
Members Become Assets
Merchant Login
Product
Features
Access
Docs
Contact
```

- [ ] **Step 4: Click 中 and verify Chinese returns**

Click the `中` button.

Expected visible text includes:

```text
支付即积分
会员即资产
商家登陆
```

- [ ] **Step 5: Verify merchant login link unchanged**

Inspect the merchant login link and confirm `href` is exactly:

```text
http://admin.mall.alipayjf.com/login?redirect=%2Findex
```

---

## Self-Review

- Spec coverage: plan only modifies `smart-business-district.html`; adds Chinese/English language switcher; covers nav, hero, stats, problem, solution, features, steps, CTA, footer; keeps merchant login link unchanged.
- Placeholder scan: no engineering placeholders remain; all translations and selectors are explicit.
- Type consistency: language keys in the dictionary match the planned `data-i18n` names.
