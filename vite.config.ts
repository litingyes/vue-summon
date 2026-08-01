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
  staged: {
    '*': 'vp check --fix',
  },
})
