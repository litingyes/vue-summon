import { playwright } from '@vitest/browser-playwright'
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
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      reporter: ['text', 'html', 'json-summary'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
    browser: {
      provider: playwright(),
      enabled: true,
      headless: true,
      screenshotFailures: false,
      instances: [{ browser: 'chromium' }],
    },
  },
  staged: {
    '*': 'vp check --fix',
  },
})

export default config
