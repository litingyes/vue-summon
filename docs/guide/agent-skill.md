# Agent Skill

Vue Summon ships an [Agent Skill](https://agentskills.io) — a reusable instruction set that teaches AI coding agents how to integrate and use this library correctly in your project. Once installed, your agent knows the setup checklist, the `summon()` / `useSummoned()` workflow, controller patterns, and the common pitfalls, so it can scaffold confirm dialogs, toasts, and modal flows without you explaining the library each time.

The skill lives in the repository at [`skills/vue-summon`](https://github.com/litingyes/vue-summon/tree/release/skills/vue-summon) and follows the open Agent Skills specification, so it works with Claude Code, OpenCode, Codex, Cursor, and [70+ other agents](https://github.com/vercel-labs/skills#supported-agents).

## Install with the skills CLI

The recommended way is the [skills CLI](https://github.com/vercel-labs/skills) from Vercel:

```bash
npx skills add litingyes/vue-summon
```

The CLI detects the coding agents installed on your machine and links the skill into each agent's skills directory (for example `.claude/skills/` or `.agents/skills/` in your project). Project-scope installation is the default, so the skill can be committed and shared with your team.

### Useful options

```bash
# List skills available in the repository without installing
npx skills add litingyes/vue-summon --list

# Install globally (available across all your projects)
npx skills add litingyes/vue-summon -g

# Install only for specific agents
npx skills add litingyes/vue-summon -a claude-code -a opencode

# Non-interactive installation (CI-friendly)
npx skills add litingyes/vue-summon -y
```

### Update and remove

```bash
# Update to the latest version
npx skills update vue-summon

# Remove it
npx skills remove vue-summon
```

## Manual installation

If you prefer not to use the CLI, copy [`skills/vue-summon/SKILL.md`](https://github.com/litingyes/vue-summon/blob/release/skills/vue-summon/SKILL.md) into your agent's skills directory — for example `.agents/skills/vue-summon/SKILL.md` or `.claude/skills/vue-summon/SKILL.md`. Any directory containing a `SKILL.md` with valid `name` and `description` frontmatter is a working skill.

## What the skill covers

- The two-step setup: install the package, mount `<SummonHost />` once
- Building summoneable components with `useSummoned()` and typed results
- The `summon()` workflow: props, `await`-ed results, `SummonDismissedError` handling
- Controller patterns: `update()` for live props, `dismiss()`, settlement semantics
- Recipes for confirm dialogs, form modals, progress toasts, keyed singletons, and custom managers
- Pitfalls: missing host, unsettled instances, teleport styling, unhandled rejections
