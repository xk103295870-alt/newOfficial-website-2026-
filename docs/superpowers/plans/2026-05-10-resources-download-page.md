# 资料与附件页面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 VitePress 文档站新增“资料与附件”页面，并在左侧 Reference 菜单中展示入口。

**Architecture:** 使用现有 VitePress 文档结构新增一个 Markdown 页面 `docs/resources.md`。附件统一放在 `docs/public/downloads/`，页面先展示真实可维护的资料条目，但在真实附件和官方链接未提供前不生成虚假链接。

**Tech Stack:** VitePress 1.6.4、Markdown、现有 `docs/.vitepress/config.mjs` 侧边栏配置。

---

## File Structure

- Modify: `docs/.vitepress/config.mjs`
  - Responsibility: 在 `Reference` 分组下新增 `{ text: '资料与附件', link: '/resources' }`。
- Create: `docs/resources.md`
  - Responsibility: 展示“微信官方资料及操作说明”和“本系统的资料”两个分类的资料卡片。
- Create: `docs/public/downloads/.gitkeep`
  - Responsibility: 保留后续上传附件的目录。

---

### Task 1: Add sidebar entry for resources page

**Files:**
- Modify: `docs/.vitepress/config.mjs`

- [ ] **Step 1: Inspect current Reference sidebar block**

Read `docs/.vitepress/config.mjs` and locate this block:

```js
      {
        text: 'Reference',
        items: [
          { text: '常见问题', link: '/faq' },
          { text: '更新日志', link: '/changelog' }
        ]
      }
```

- [ ] **Step 2: Add the new menu item**

Replace the block with:

```js
      {
        text: 'Reference',
        items: [
          { text: '常见问题', link: '/faq' },
          { text: '更新日志', link: '/changelog' },
          { text: '资料与附件', link: '/resources' }
        ]
      }
```

- [ ] **Step 3: Verify syntax visually**

Confirm that:

- The comma after `{ text: '更新日志', link: '/changelog' }` exists.
- The `Reference` object remains inside `themeConfig.sidebar`.
- No other nav or sidebar entries are changed.

---

### Task 2: Create downloads directory placeholder

**Files:**
- Create: `docs/public/downloads/.gitkeep`

- [ ] **Step 1: Create directory**

Run:

```bash
mkdir -p docs/public/downloads
```

Expected: command exits with status `0`.

- [ ] **Step 2: Create placeholder file**

Run:

```bash
touch docs/public/downloads/.gitkeep
```

Expected: file exists at `docs/public/downloads/.gitkeep`.

- [ ] **Step 3: Verify directory contents**

Run:

```bash
find docs/public/downloads -maxdepth 1 -type f -print
```

Expected output includes:

```text
docs/public/downloads/.gitkeep
```

---

### Task 3: Create resources page

**Files:**
- Create: `docs/resources.md`

- [ ] **Step 1: Create Markdown page content**

Create `docs/resources.md` with exactly this content:

```markdown
# 资料与附件

这里汇总客户在系统接入、上线准备和日常操作中可能需要的资料。部分资料为微信官方说明链接，部分资料为本系统提供的模板或清单。

::: tip 使用说明
如需下载纸质资料模板，请在对应资料右侧查看状态。当前未上传真实附件的资料会标记为“待上传附件”，避免误导客户下载无效文件。
:::

## 微信官方资料及操作说明

<div class="resource-list">
  <section class="resource-card">
    <div>
      <h3>微信支付商户平台操作指引</h3>
      <p>用于客户了解微信支付商户平台的基础操作、账户管理和常见配置流程。</p>
      <p class="resource-meta">来源：微信官方资料 / 外部链接</p>
    </div>
    <span class="resource-status">待补充链接</span>
  </section>

  <section class="resource-card">
    <div>
      <h3>微信小程序认证与备案说明</h3>
      <p>用于客户提前准备小程序认证、备案、主体资质等相关资料。</p>
      <p class="resource-meta">来源：微信官方资料 / 外部链接</p>
    </div>
    <span class="resource-status">待补充链接</span>
  </section>

  <section class="resource-card">
    <div>
      <h3>微信支付产品能力说明</h3>
      <p>用于客户了解支付、退款、账单、分账等微信支付相关能力。</p>
      <p class="resource-meta">来源：微信官方资料 / 外部链接</p>
    </div>
    <span class="resource-status">待补充链接</span>
  </section>

  <section class="resource-card">
    <div>
      <h3>商户号配置说明</h3>
      <p>用于客户或技术人员准备商户号、API 证书、回调地址等接入配置。</p>
      <p class="resource-meta">来源：微信官方资料 / 外部链接</p>
    </div>
    <span class="resource-status">待补充链接</span>
  </section>
</div>

## 本系统的资料

<div class="resource-list">
  <section class="resource-card">
    <div>
      <h3>商户入驻资料清单</h3>
      <p>用于商圈或运营方收集商户基础信息、联系人信息、经营资料和入驻配置。</p>
      <p class="resource-meta">文件类型：表格 / 模板资料</p>
    </div>
    <span class="resource-status">待上传附件</span>
  </section>

  <section class="resource-card">
    <div>
      <h3>停车系统对接资料清单</h3>
      <p>用于提前整理停车系统厂商、停车场信息、接口联系人和联调所需资料。</p>
      <p class="resource-meta">文件类型：表格 / 对接清单</p>
    </div>
    <span class="resource-status">待上传附件</span>
  </section>

  <section class="resource-card">
    <div>
      <h3>小程序页面装修资料说明</h3>
      <p>用于准备小程序首页 Banner、品牌图、活动图、商户图片和页面展示文案。</p>
      <p class="resource-meta">文件类型：说明文档 / 素材清单</p>
    </div>
    <span class="resource-status">待上传附件</span>
  </section>

  <section class="resource-card">
    <div>
      <h3>系统上线前检查清单</h3>
      <p>用于上线前检查基础配置、支付配置、商户数据、停车数据和运营活动配置。</p>
      <p class="resource-meta">文件类型：检查清单 / 操作资料</p>
    </div>
    <span class="resource-status">待上传附件</span>
  </section>

  <section class="resource-card">
    <div>
      <h3>会员隐私协议模板</h3>
      <p>用于商圈或商户在上线会员体系前准备隐私政策、用户授权说明等内容。</p>
      <p class="resource-meta">文件类型：Word / PDF 模板</p>
    </div>
    <span class="resource-status">待上传附件</span>
  </section>
</div>

<style>
.resource-list {
  display: grid;
  gap: 16px;
  margin-top: 20px;
}

.resource-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: color-mix(in srgb, var(--vp-c-bg-soft) 76%, transparent);
}

.resource-card h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.resource-card p {
  margin: 0;
  line-height: 1.8;
}

.resource-meta {
  margin-top: 10px !important;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.resource-status {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 104px;
  margin-top: 2px;
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .resource-card {
    flex-direction: column;
    gap: 12px;
  }

  .resource-status {
    align-self: flex-start;
  }
}
</style>
```

- [ ] **Step 2: Confirm no fake links exist**

Search the new page for `href=`.

Run:

```bash
grep -n "href=" docs/resources.md || true
```

Expected: no output.

- [ ] **Step 3: Confirm required section names exist**

Run:

```bash
grep -n "微信官方资料及操作说明\|本系统的资料\|会员隐私协议模板" docs/resources.md
```

Expected output includes all three names.

---

### Task 4: Build and verify VitePress output

**Files:**
- Read/verify generated output under `docs/.vitepress/dist/`

- [ ] **Step 1: Install dependencies if needed**

Run:

```bash
npm install
```

Expected: dependencies install successfully, or npm reports packages are already up to date.

- [ ] **Step 2: Build docs**

Run:

```bash
npm run docs:build
```

Expected output includes successful VitePress build and no fatal errors.

- [ ] **Step 3: Verify generated resources page exists**

Run:

```bash
test -f docs/.vitepress/dist/resources.html && echo "resources page built"
```

Expected output:

```text
resources page built
```

- [ ] **Step 4: Verify downloads directory is copied**

Run:

```bash
test -d docs/.vitepress/dist/downloads && echo "downloads directory built"
```

Expected output:

```text
downloads directory built
```

If VitePress does not copy an empty `.gitkeep`-only public directory, this check may fail. In that case, keep `docs/public/downloads/.gitkeep`; the directory will be created in future builds when real files are added.

---

### Task 5: Final manual review

**Files:**
- Review: `docs/resources.md`
- Review: `docs/.vitepress/config.mjs`

- [ ] **Step 1: Review page content**

Confirm `docs/resources.md` includes:

- Page title: `# 资料与附件`
- Section: `## 微信官方资料及操作说明`
- Section: `## 本系统的资料`
- Item: `会员隐私协议模板`
- No fake `href=` links

- [ ] **Step 2: Review sidebar content**

Confirm `docs/.vitepress/config.mjs` includes:

```js
          { text: '资料与附件', link: '/resources' }
```

- [ ] **Step 3: Report completion**

Report these exact outcomes to the user:

- 已新增 `docs/resources.md` 资料与附件页面。
- 已在 `Reference` 菜单下新增“资料与附件”。
- 已创建 `docs/public/downloads/` 目录用于后续放置附件。
- 已保留“待补充链接/待上传附件”状态，没有生成虚假下载链接。
- 已运行 `npm run docs:build` 验证，或说明构建失败的具体原因。

---

## Self-Review

- Spec coverage: plan covers sidebar entry, `docs/resources.md`, two categories, all requested first-version items, `docs/public/downloads/`, no fake links, and build verification.
- Placeholder scan: user-facing page intentionally uses explicit status text `待补充链接` and `待上传附件` because the spec requires no fake links before real files/links are provided. The implementation plan itself contains no incomplete engineering placeholders.
- Type/path consistency: all paths match the existing project structure: `docs/.vitepress/config.mjs`, `docs/resources.md`, and `docs/public/downloads/.gitkeep`.
