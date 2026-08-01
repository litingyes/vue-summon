#!/usr/bin/env tsx
import { execSync, spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

import { versionBump } from 'bumpp'

function run(command: string, args: string[], ignoreStdout = false): void {
  const result = spawnSync(command, args, {
    stdio: ['inherit', ignoreStdout ? 'ignore' : 'inherit', 'inherit'],
    shell: process.platform === 'win32',
  })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

function ensureCleanWorkingTree(): void {
  const status = execSync('git status --porcelain', { encoding: 'utf-8' }).trim()
  if (status) {
    console.error('Working tree is not clean. Commit or stash your changes before releasing.')
    process.exit(1)
  }
}

async function main(): Promise<void> {
  ensureCleanWorkingTree()

  run('pnpm', ['check'])
  run('pnpm', ['test'])

  await versionBump({
    files: ['package.json'],
    commit: 'chore(release): v%s',
    tag: 'v%s',
    push: true,
    all: true,
    confirm: true,
    execute: async (operation) => {
      const version = operation.state.newVersion
      run('pnpm', ['exec', 'changelogen', '--output', 'CHANGELOG.md', '-r', version])

      const date = new Date().toLocaleDateString('en-CA')
      const changelog = readFileSync('CHANGELOG.md', 'utf-8')
      const headingPattern = new RegExp(`^## v${version.replace(/\./g, '\\.')}$`, 'm')
      writeFileSync('CHANGELOG.md', changelog.replace(headingPattern, `## v${version} (${date})`))
    },
  })
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
