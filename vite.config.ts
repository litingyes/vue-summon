import { preview } from '@vitest/browser-preview'
import { defineConfig, type UserConfig } from 'vite-plus'

const config: UserConfig = defineConfig({
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
    ignorePatterns: ['docs/**'],
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
  pack: {
    entry: ['src/index.ts'],
    format: ['esm'],
    platform: 'neutral',
    dts: true,
    sourcemap: true,
    deps: {
      neverBundle: ['vue'],
    },
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

export default config
