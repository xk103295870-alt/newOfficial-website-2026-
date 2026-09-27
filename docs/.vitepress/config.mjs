import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '文档',
  description: '智慧商圈数字化CRM运营方案文档',
  lang: 'zh-CN',
  base: '/docs/',
  cleanUrls: false,
  outDir: '../.docs-build',
  srcExclude: ['superpowers/**'],
  
  appearance: 'dark',
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '首页', link: '../index.html' },
      { text: '产品', link: '/overview' },
      { text: '接入', link: '/prerequisites' },
      { text: '联系', link: 'mailto:xiaoke@weinuo.work' }
    ],
    
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: '产品概述', link: '/overview' },
          { text: '快速开始', link: '/quickstart' },
          { text: '系统架构', link: '/architecture' }
        ]
      },
      {
        text: 'Integration',
        items: [
          { text: '接入前提', link: '/prerequisites' },
          { text: 'API 文档', link: '/api' },
          { text: 'Webhook 配置', link: '/webhook' }
        ]
      },
      {
        text: '操作手册',
        collapsed: false,
        items: [
          { text: '首页', link: '/manual#首页' },
          { text: '小程序管理', link: '/manual#小程序管理' },
          { text: '小程序页面装修', link: '/manual#小程序页面装修' },
          { text: '商户管理', link: '/manual#商户管理' },
          { text: '商品券管理', link: '/manual#商品券管理' },
          { text: '会员停车管理', link: '/manual#会员停车管理' },
          { text: '会员中心', link: '/manual#会员中心' },
          { text: '会员营销活动', link: '/manual#会员营销活动' },
          { text: '订单中心', link: '/manual#订单中心' },
          { text: '公域管理', link: '/manual#公域管理' },
          { text: '智慧营销', link: '/manual#智慧营销' },
          { text: 'BI商业分析', link: '/manual#bi商业分析' },
          { text: '门店核销', link: '/manual#门店核销' },
          { text: '圈店流程', link: '/manual#圈店流程' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: '常见问题', link: '/faq' },
        ]
      }
    ],
    
    
    footer: {
      message: 'W工作室 · 智慧商圈数字化CRM',
      copyright: '© 2026 微诺技术工作室 · www.weinuo.work'
    },
    
    search: {
      provider: 'local'
    },
    
    outline: {
      label: '本页内容',
      level: [2, 3]
    },
    
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色主题',
    darkModeSwitchTitle: '切换到暗色主题',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
    externalLinkIcon: true
  },
  
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/docs/logo.svg' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap', rel: 'stylesheet' }]
  ]
})
