# AI Agent Skill

Vue Summon 随仓库提供了一个 [Agent Skill](https://agentskills.io) —— 一套可复用的指令集,用来教 AI 编程助手如何在你的项目中正确地集成和使用本库。安装之后,你的 agent 就掌握了完整的接入清单、`summon()` / `useSummoned()` 工作流、控制器用法以及常见坑,无需你每次解释,就能直接搭建确认对话框、toast、模态流程等。

该 skill 位于仓库的 [`skills/vue-summon`](https://github.com/litingyes/vue-summon/tree/release/skills/vue-summon) 目录,遵循开放的 Agent Skills 规范,因此兼容 Claude Code、OpenCode、Codex、Cursor 等 [70+ 编程 agent](https://github.com/vercel-labs/skills#supported-agents)。

## 使用 skills CLI 安装

推荐使用 Vercel 的 [skills CLI](https://github.com/vercel-labs/skills):

```bash
npx skills add litingyes/vue-summon
```

CLI 会自动检测你机器上安装的编程 agent,并把 skill 链接到各 agent 的 skills 目录(例如项目下的 `.claude/skills/` 或 `.agents/skills/`)。默认安装到项目级,方便随仓库提交、与团队共享。

### 常用选项

```bash
# 只列出仓库中可用的 skill,不安装
npx skills add litingyes/vue-summon --list

# 全局安装(对所有项目生效)
npx skills add litingyes/vue-summon -g

# 只为指定的 agent 安装
npx skills add litingyes/vue-summon -a claude-code -a opencode

# 非交互式安装(适用于 CI)
npx skills add litingyes/vue-summon -y
```

### 更新与移除

```bash
# 更新到最新版本
npx skills update vue-summon

# 移除
npx skills remove vue-summon
```

## 手动安装

如果你不想使用 CLI,也可以直接把 [`skills/vue-summon/SKILL.md`](https://github.com/litingyes/vue-summon/blob/release/skills/vue-summon/SKILL.md) 拷贝到你的 agent 的 skills 目录 —— 例如 `.agents/skills/vue-summon/SKILL.md` 或 `.claude/skills/vue-summon/SKILL.md`。任何包含合法 `name` 与 `description` frontmatter 的 `SKILL.md` 目录都是一个可用的 skill。

## Skill 涵盖的内容

- 两步接入:安装依赖、挂载一次 `<SummonHost />`
- 使用 `useSummoned()` 编写可召唤组件并获得类型化结果
- `summon()` 工作流:props 传参、`await` 获取结果、`SummonDismissedError` 处理
- 控制器模式:`update()` 实时更新 props、`dismiss()`、结算语义
- 常见场景示例:确认对话框、表单弹窗、进度 toast、key 单例、自定义管理器
- 常见坑:忘记挂载 host、实例未结算、teleport 样式作用域、未处理的 rejection
