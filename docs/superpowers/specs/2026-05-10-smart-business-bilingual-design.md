# 商业会员系统页中英文切换设计

## 目标

为 `smart-business-district.html` 增加中英文双语切换能力，让商业会员系统页面支持中文和英文浏览。

## 范围

本次只修改商业会员系统页面，不改首页、不改文档站、不新增后端服务。

## 修改文件

- `smart-business-district.html`

## 语言范围

只支持：

- 中文：`zh`
- 英文：`en`

不加入越南语。

## 页面交互

在顶部导航右侧、靠近“商家登陆”按钮的位置增加语言切换按钮：

- `中`
- `EN`

默认显示中文。点击 `EN` 后页面主要文案切换为英文；点击 `中` 后恢复中文。

## 翻译覆盖范围

为页面主要文案增加 `data-i18n` 标记，并通过页面内翻译字典替换文字。覆盖：

- 导航：产品、功能、接入、文档、联系、商家登陆
- 首屏：业务标签、主标题、副标题
- 首屏统计卡片
- 痛点/问题板块
- 解决方案板块
- 产品功能板块
- 接入流程板块
- 底部 CTA
- 页脚导航和版权文案

## 技术设计

在页面底部脚本中增加：

```js
const translations = {
  zh: { ... },
  en: { ... }
}
```

新增 `setLanguage(lang)`：

- 查找所有 `[data-i18n]` 元素；
- 根据 key 替换 `innerHTML`；
- 更新 `<html lang="zh-CN">` 或 `<html lang="en">`；
- 更新语言按钮 active 状态；
- 使用 `localStorage` 保存当前语言。

页面加载时优先读取 `localStorage.getItem('smartBusinessLang')`，没有则默认 `zh`。

## 样式设计

新增 `.lang-switcher` 和 `.lang-btn` 样式，保持与现有机械/边框风格一致：

- 普通按钮为透明背景、边框；
- active 按钮使用绿色 accent 背景；
- 不影响已有导航布局。

## 链接要求

- “商家登陆”链接保持不变：`http://admin.mall.alipayjf.com/login?redirect=%2Findex`
- 文档链接保持不变：`./docs/index.html`
- 页面锚点链接保持不变。

## 验收标准

- 本地打开 `smart-business-district.html`，默认中文显示正常。
- 顶部导航出现 `中` 和 `EN` 两个语言按钮。
- 点击 `EN` 后主要内容切换为英文。
- 点击 `中` 后主要内容恢复中文。
- 商家登陆按钮链接不变。
- 控制台无 JavaScript 报错。
