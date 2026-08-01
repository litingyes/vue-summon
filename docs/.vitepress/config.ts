import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type DefaultTheme } from 'vitepress'

const guideSidebarEn: DefaultTheme.SidebarItem[] = [
  {
    text: 'Introduction',
    items: [
      { text: 'Why Vue Summon', link: '/guide/why-vue-summon' },
      { text: 'Getting Started', link: '/guide/getting-started' },
      { text: 'Agent Skill', link: '/guide/agent-skill' },
    ],
  },
  {
    text: 'Essentials',
    items: [
      { text: 'Summoning Components', link: '/guide/summon' },
      { text: 'The Controller', link: '/guide/controller' },
      { text: 'Scoped Summoning', link: '/guide/scoped-summon' },
      { text: 'Keys & Dismissal', link: '/guide/key-and-dismiss' },
      { text: 'Custom Managers', link: '/guide/custom-manager' },
    ],
  },
  {
    text: 'Reference',
    items: [
      { text: 'API Reference', link: '/api/' },
      { text: 'Live Examples', link: '/examples/' },
    ],
  },
]

const guideSidebarZh: DefaultTheme.SidebarItem[] = [
  {
    text: '介绍',
    items: [
      { text: '为什么需要 Vue Summon', link: '/zh/guide/why-vue-summon' },
      { text: '快速上手', link: '/zh/guide/getting-started' },
      { text: 'AI Agent Skill', link: '/zh/guide/agent-skill' },
    ],
  },
  {
    text: '核心概念',
    items: [
      { text: '召唤组件', link: '/zh/guide/summon' },
      { text: '控制器', link: '/zh/guide/controller' },
      { text: '作用域召唤', link: '/zh/guide/scoped-summon' },
      { text: 'Key 与关闭', link: '/zh/guide/key-and-dismiss' },
      { text: '自定义管理器', link: '/zh/guide/custom-manager' },
    ],
  },
  {
    text: '参考',
    items: [
      { text: 'API 参考', link: '/zh/api/' },
      { text: '在线示例', link: '/zh/examples/' },
    ],
  },
]

const searchLocales: NonNullable<DefaultTheme.LocalSearchOptions['locales']> = {
  zh: {
    translations: {
      button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
      modal: {
        noResultsText: '无法找到相关结果',
        resetButtonTitle: '清除查询条件',
        footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
      },
    },
  },
}

export default defineConfig({
  title: 'Vue Summon',
  description:
    'Imperatively render Vue components from anywhere — dialogs, toasts, modals, without cluttering your templates.',
  lastUpdated: true,
  cleanUrls: true,
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]],
  themeConfig: {
    logo: '/logo.svg',
    socialLinks: [{ icon: 'github', link: 'https://github.com/litingyes/vue-summon' }],
    search: {
      provider: 'local',
      options: { locales: searchLocales },
    },
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/getting-started', activeMatch: '/guide/' },
          { text: 'API', link: '/api/', activeMatch: '/api/' },
          { text: 'Examples', link: '/examples/', activeMatch: '/examples/' },
          { text: 'Changelog', link: '/changelog/', activeMatch: '/changelog/' },
        ],
        sidebar: {
          '/guide/': guideSidebarEn,
          '/api/': guideSidebarEn,
          '/examples/': guideSidebarEn,
        },
        editLink: {
          pattern: 'https://github.com/litingyes/vue-summon/edit/release/docs/:path',
          text: 'Edit this page on GitHub',
        },
        footer: {
          message: 'Released under the MIT License.',
          copyright: 'Copyright © 2026-present litingyes',
        },
      },
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh/guide/getting-started', activeMatch: '/zh/guide/' },
          { text: 'API', link: '/zh/api/', activeMatch: '/zh/api/' },
          { text: '示例', link: '/zh/examples/', activeMatch: '/zh/examples/' },
          { text: '更新日志', link: '/zh/changelog/', activeMatch: '/zh/changelog/' },
        ],
        sidebar: {
          '/zh/guide/': guideSidebarZh,
          '/zh/api/': guideSidebarZh,
          '/zh/examples/': guideSidebarZh,
        },
        editLink: {
          pattern: 'https://github.com/litingyes/vue-summon/edit/release/docs/:path',
          text: '在 GitHub 上编辑此页',
        },
        footer: {
          message: '基于 MIT 许可发布。',
          copyright: 'Copyright © 2026-present litingyes',
        },
        outline: { label: '页面导航' },
        lastUpdated: { text: '最后更新于' },
        darkModeSwitchLabel: '主题',
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '回到顶部',
        langMenuLabel: '多语言',
        docFooter: { prev: '上一页', next: '下一页' },
      },
    },
  },
  vite: {
    resolve: {
      alias: {
        'vue-summon': fileURLToPath(new URL('../../src/index.ts', import.meta.url)),
      },
    },
  },
})
