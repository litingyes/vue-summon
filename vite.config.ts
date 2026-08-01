import { preview } from '@vitest/browser-preview'
import { defineConfig } from 'vite-plus'

export default defineConfig({
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
    plugins: [
      'eslint',
      'typescript',
      'unicorn',
      'react-perf',
      'oxc',
      'import',
      'jsx-a11y',
      'promise',
      'vue',
    ],
  },
  fmt: {
    semi: false,
    singleQuote: true,
    sortImports: true,
    sortPackageJson: true,
  },
  define: {
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  },
  test: {
    browser: {
      provider: preview(),
      enabled: true,
      instances: [{ browser: 'chromium' }],
    },
  },
  staged: {
    '*': 'vp check --fix',
  },
})
