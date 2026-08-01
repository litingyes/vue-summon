import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import Changelog from './components/Changelog.vue'
import DemoConfirm from './components/DemoConfirm.vue'
import DemoKey from './components/DemoKey.vue'
import DemoProgress from './components/DemoProgress.vue'
import DemoToast from './components/DemoToast.vue'
import Layout from './Layout.vue'

import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('Changelog', Changelog)
    app.component('DemoConfirm', DemoConfirm)
    app.component('DemoKey', DemoKey)
    app.component('DemoProgress', DemoProgress)
    app.component('DemoToast', DemoToast)
  },
} satisfies Theme
