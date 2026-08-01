# Vue Summon

Imperatively render Vue components from anywhere — dialogs, toasts, modals, without cluttering your templates.

- **Peer dependency**: `vue@3`
- **Stack**: TypeScript, Vue 3, vite-plus (`vp`), Vitest (browser mode), VitePress
- **Package manager**: pnpm

## Project Structure

| Path    | Description                                                                                |
| ------- | ------------------------------------------------------------------------------------------ |
| `src/`  | Library source: `index.ts` (public API), `context.ts`, `host.ts`, `manager.ts`, `types.ts` |
| `test/` | Vitest tests running in browser mode (Playwright + Chromium)                               |
| `docs/` | VitePress documentation — English at `docs/`, 简体中文 at `docs/zh/`                       |

## Keep Source, Tests, and Docs in Sync

Every change to `src/` MUST be accompanied by the corresponding updates to `test/` and `docs/` in the same change:

- New/changed public API → update or add tests in `test/`, and update the API reference (`docs/api/index.md` + `docs/zh/api/index.md`) and any affected guides.
- Changed behavior → update tests and every doc page that describes it.
- Docs are bilingual — always update BOTH English (`docs/`) and Chinese (`docs/zh/`) versions.

Never leave features, tests, and docs misaligned. A change is not done until all three agree.

## Lint & Format After Every Change

After modifying code, run `vp check --fix` on the changed files:

```bash
vp check --fix src/manager.ts test/summon.test.ts
```

This applies formatting, lint auto-fixes, and type checks. Do not consider a change complete until it passes.

## Commands

```bash
pnpm test        # run tests with coverage (thresholds: 100% lines/functions/branches/statements)
pnpm typecheck   # tsc --noEmit
pnpm check       # vp check (format + lint + type checks)
pnpm build       # vp pack → dist/
pnpm docs:dev    # VitePress dev server
```

## Code Style

- No semicolons, single quotes, sorted imports and sorted `package.json` keys (enforced by `vite-plus` fmt)
- Strict TypeScript; public API types inferred via `vue-component-type-helpers`
- Tests run in a real Chromium browser via `@vitest/browser-playwright`; use `vitest-browser-vue` for rendering
