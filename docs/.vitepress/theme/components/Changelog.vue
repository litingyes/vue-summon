<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, ref } from 'vue'

import changelogRaw from '../../../../CHANGELOG.md?raw'
import { parseChangelog, type ChangelogRelease } from '../composables/changelog'

const releases = parseChangelog(changelogRaw)

interface LocaleLabels {
  title: string
  subtitle: string
  searchPlaceholder: string
  expandAll: string
  collapseAll: string
  latest: string
  initial: string
  compareChanges: string
  copyLink: string
  copied: string
  noResults: string
  groupsSummary: (groups: number, entries: number) => string
  versionTypes: { major: string; minor: string; patch: string }
}

const ui: Record<string, LocaleLabels> = {
  en: {
    title: 'Changelog',
    subtitle: 'Release history for Vue Summon',
    searchPlaceholder: 'Search changes...',
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',
    latest: 'Latest',
    initial: 'Initial',
    compareChanges: 'Compare changes',
    copyLink: 'Copy link',
    copied: 'Copied!',
    noResults: 'No matching changes found.',
    groupsSummary: (groups, entries) =>
      `${groups} group${groups === 1 ? '' : 's'} · ${entries} change${entries === 1 ? '' : 's'}`,
    versionTypes: { major: 'Major', minor: 'Minor', patch: 'Patch' },
  },
  zh: {
    title: '更新日志',
    subtitle: 'Vue Summon 的版本发布历史',
    searchPlaceholder: '搜索变更...',
    expandAll: '全部展开',
    collapseAll: '全部收起',
    latest: '最新',
    initial: '初始版本',
    compareChanges: '对比变更',
    copyLink: '复制链接',
    copied: '已复制',
    noResults: '没有找到匹配的变更。',
    groupsSummary: (groups, entries) => `${groups} 个分组 · ${entries} 条变更`,
    versionTypes: { major: '重大', minor: '次要', patch: '修订' },
  },
}

const { lang } = useData()
const t = computed(() => (lang.value === 'zh-CN' ? ui.zh : ui.en))

const query = ref('')
const normalizedQuery = computed(() => query.value.trim().toLowerCase())
const copiedId = ref<string | null>(null)

const versionIds = computed(() => releases.map((r) => versionId(r.version)))
const expanded = ref(new Set<string>([versionIds.value[0]]))

const isFiltering = computed(() => normalizedQuery.value.length > 0)

const filteredReleases = computed(() => {
  if (!isFiltering.value) return releases

  return releases
    .map((release) => {
      const groups = release.groups
        .map((group) => {
          const entries = group.entries.filter(
            (entry) =>
              entry.message.toLowerCase().includes(normalizedQuery.value) ||
              (entry.scope && entry.scope.toLowerCase().includes(normalizedQuery.value)) ||
              group.title.toLowerCase().includes(normalizedQuery.value) ||
              release.version.includes(normalizedQuery.value),
          )
          return entries.length ? { ...group, entries } : null
        })
        .filter(Boolean) as ChangelogRelease['groups']

      return groups.length ? { ...release, groups } : null
    })
    .filter(Boolean) as ChangelogRelease[]
})

const totalChanges = computed(() =>
  releases.reduce(
    (sum, release) => sum + release.groups.reduce((g, group) => g + group.entries.length, 0),
    0,
  ),
)

const releaseTypes = computed(() => {
  const map: Record<string, 'major' | 'minor' | 'patch' | 'initial'> = {}
  for (let i = 0; i < releases.length; i++) {
    map[releases[i].version] = versionType(i)
  }
  return map
})

function versionId(version: string): string {
  return `v${version.replace(/\./g, '-')}`
}

function isExpanded(id: string): boolean {
  if (isFiltering.value) return true
  return expanded.value.has(id)
}

function toggleVersion(id: string): void {
  if (isFiltering.value) return
  const next = new Set(expanded.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expanded.value = next
}

function expandAll(): void {
  expanded.value = new Set(versionIds.value)
}

function collapseAll(): void {
  expanded.value = new Set()
}

function versionType(index: number): 'major' | 'minor' | 'patch' | 'initial' {
  const next = releases[index + 1]
  if (!next) return 'initial'

  const current = releases[index].version.split('.').map(Number)
  const previous = next.version.split('.').map(Number)

  if (current[0] > previous[0]) return 'major'
  if (current[1] > previous[1]) return 'minor'
  return 'patch'
}

function typeClass(type: 'major' | 'minor' | 'patch' | 'initial' | null): string {
  switch (type) {
    case 'major':
      return 'type-major'
    case 'minor':
      return 'type-minor'
    case 'patch':
      return 'type-patch'
    case 'initial':
      return 'type-initial'
    default:
      return ''
  }
}

function typeLabel(type: 'major' | 'minor' | 'patch' | 'initial' | null): string {
  if (!type) return ''
  if (type === 'initial') return t.value.initial
  return t.value.versionTypes[type]
}

async function copyLink(id: string): Promise<void> {
  if (typeof window === 'undefined') return

  const url = `${window.location.origin}${window.location.pathname}#${id}`
  try {
    await navigator.clipboard.writeText(url)
    copiedId.value = id
    window.setTimeout(() => {
      if (copiedId.value === id) copiedId.value = null
    }, 1500)
  } catch {
    // ignore
  }
}

function scopeClass(scope: string): string {
  const map: Record<string, string> = {
    release: 'scope-release',
    action: 'scope-action',
    ci: 'scope-ci',
    docs: 'scope-docs',
    test: 'scope-test',
  }
  return map[scope.toLowerCase()] || 'scope-default'
}
</script>

<template>
  <div class="changelog-page">
    <header class="changelog-header">
      <div class="changelog-header-main">
        <h1 class="changelog-title">{{ t.title }}</h1>
        <p class="changelog-subtitle">
          {{ releases[0]?.version ? `${t.subtitle} · v${releases[0].version}` : t.subtitle }}
        </p>
      </div>
      <div class="changelog-header-actions">
        <div class="changelog-search-wrap">
          <svg class="changelog-search-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z"
            />
          </svg>
          <input
            v-model="query"
            class="changelog-search"
            type="text"
            :placeholder="t.searchPlaceholder"
          />
        </div>
        <button class="changelog-toggle-btn" type="button" @click="expandAll">
          {{ t.expandAll }}
        </button>
        <button class="changelog-toggle-btn" type="button" @click="collapseAll">
          {{ t.collapseAll }}
        </button>
      </div>
    </header>

    <div class="changelog-stats">
      <span class="changelog-stat"
        >{{ releases.length }} version{{ releases.length === 1 ? '' : 's' }}</span
      >
      <span class="changelog-stat"
        >{{ totalChanges }} change{{ totalChanges === 1 ? '' : 's' }}</span
      >
    </div>

    <div v-if="filteredReleases.length === 0" class="changelog-empty">
      {{ t.noResults }}
    </div>

    <div class="changelog-timeline">
      <div
        v-for="(release, index) in filteredReleases"
        :id="versionId(release.version)"
        :key="release.version"
        class="changelog-release"
        :class="{ 'is-expanded': isExpanded(versionId(release.version)) }"
      >
        <div class="changelog-marker">
          <div class="changelog-dot" />
        </div>

        <div class="changelog-card">
          <div
            class="changelog-card-header"
            role="button"
            tabindex="0"
            @click="toggleVersion(versionId(release.version))"
            @keydown.enter="toggleVersion(versionId(release.version))"
          >
            <div class="changelog-version-meta">
              <span class="changelog-version">v{{ release.version }}</span>
              <span v-if="index === 0" class="changelog-badge latest">{{ t.latest }}</span>
              <span
                v-if="releaseTypes[release.version]"
                class="changelog-badge"
                :class="typeClass(releaseTypes[release.version])"
              >
                {{ typeLabel(releaseTypes[release.version]) }}
              </span>
              <span v-if="release.date" class="changelog-date">{{ release.date }}</span>
            </div>

            <div class="changelog-card-actions">
              <a
                v-if="release.compareUrl"
                class="changelog-compare"
                :href="release.compareUrl"
                target="_blank"
                rel="noopener noreferrer"
                @click.stop
              >
                {{ t.compareChanges }}
              </a>
              <button
                class="changelog-icon-btn"
                type="button"
                :title="t.copyLink"
                @click.stop="copyLink(versionId(release.version))"
              >
                <svg
                  v-if="copiedId !== versionId(release.version)"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7a5 5 0 0 0-5 5 5 5 0 0 0 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1ZM8 13h8v-2H8v2Zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.71-1.39 3.1-3.1 3.1h-4V17h4a5 5 0 0 0 5-5 5 5 0 0 0-5-5Z"
                  />
                </svg>
                <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" />
                </svg>
                <span class="changelog-tooltip">{{
                  copiedId === versionId(release.version) ? t.copied : t.copyLink
                }}</span>
              </button>
              <span class="changelog-chevron">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41Z" />
                </svg>
              </span>
            </div>
          </div>

          <div class="changelog-card-body">
            <div v-if="!isExpanded(versionId(release.version))" class="changelog-summary">
              {{
                t.groupsSummary(
                  release.groups.length,
                  release.groups.reduce((sum, g) => sum + g.entries.length, 0),
                )
              }}
            </div>

            <template v-else>
              <section v-for="group in release.groups" :key="group.key" class="changelog-group">
                <h3 class="changelog-group-title">
                  <span class="changelog-group-emoji">{{ group.title.split(' ')[0] }}</span>
                  <span>{{ group.title.replace(/^[^\s]+\s*/, '') }}</span>
                  <span class="changelog-count">{{ group.entries.length }}</span>
                </h3>

                <ul class="changelog-entries">
                  <li
                    v-for="entry in group.entries"
                    :key="entry.url || entry.message"
                    class="changelog-entry"
                  >
                    <template v-if="entry.author">
                      <a
                        class="changelog-author"
                        :href="entry.url"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          v-if="entry.authorAvatar"
                          class="changelog-avatar"
                          :src="entry.authorAvatar"
                          :alt="entry.author"
                          loading="lazy"
                        />
                        <span class="changelog-author-name">{{ entry.author }}</span>
                      </a>
                      <span class="changelog-author-thanks">{{ entry.message }}</span>
                    </template>

                    <template v-else>
                      <span
                        v-if="entry.scope"
                        class="changelog-scope"
                        :class="scopeClass(entry.scope)"
                      >
                        {{ entry.scope }}
                      </span>
                      <span class="changelog-message">{{ entry.message }}</span>
                      <a
                        v-if="entry.url"
                        class="changelog-commit"
                        :href="entry.url"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <code>{{ entry.hash }}</code>
                      </a>
                    </template>
                  </li>
                </ul>
              </section>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.changelog-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 0 64px;
}

.changelog-header {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.changelog-title {
  margin: 0 0 8px;
  font-size: 40px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--vp-c-text-1);
  letter-spacing: -0.02em;
}

.changelog-subtitle {
  margin: 0;
  color: var(--vp-c-text-2);
}

.changelog-header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.changelog-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.changelog-search-icon {
  position: absolute;
  left: 12px;
  width: 16px;
  height: 16px;
  fill: var(--vp-c-text-3);
  pointer-events: none;
}

.changelog-search {
  width: 220px;
  padding: 7px 12px 7px 36px;
  font-size: 14px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.changelog-search:hover,
.changelog-search:focus {
  border-color: var(--vp-c-brand-1);
}

.changelog-toggle-btn {
  padding: 7px 12px;
  font-size: 14px;
  color: var(--vp-c-text-1);
  cursor: pointer;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  transition:
    background 0.2s,
    border-color 0.2s;
}

.changelog-toggle-btn:hover {
  background: var(--vp-c-bg-elv);
  border-color: var(--vp-c-brand-1);
}

.changelog-stats {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.changelog-stat {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border-radius: 999px;
}

.changelog-empty {
  padding: 64px 24px;
  color: var(--vp-c-text-2);
  text-align: center;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
}

.changelog-timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.changelog-timeline::before {
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 11px;
  width: 2px;
  content: '';
  background: var(--vp-c-divider);
  border-radius: 2px;
}

.changelog-release {
  position: relative;
  display: flex;
  gap: 16px;
}

.changelog-marker {
  position: relative;
  flex-shrink: 0;
  width: 24px;
}

.changelog-dot {
  width: 16px;
  height: 16px;
  margin-top: 10px;
  background: var(--vp-c-bg);
  border: 3px solid var(--vp-c-brand-1);
  border-radius: 50%;
}

.changelog-card {
  flex: 1;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  transition: box-shadow 0.2s;
}

.changelog-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.changelog-card-header {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  cursor: pointer;
  background: var(--vp-c-bg-elv-mute, var(--vp-c-bg));
  transition: background 0.2s;
}

.changelog-card-header:hover {
  background: var(--vp-c-bg-elv);
}

.changelog-version-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.changelog-version {
  font-size: 20px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.changelog-badge {
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
}

.changelog-badge.latest {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.changelog-badge.type-major {
  color: var(--vp-badge-danger-text);
  background: var(--vp-badge-danger-bg);
}

.changelog-badge.type-minor {
  color: var(--vp-badge-info-text);
  background: var(--vp-badge-info-bg);
}

.changelog-badge.type-patch {
  color: var(--vp-badge-success-text);
  background: var(--vp-badge-success-bg);
}

.changelog-badge.type-initial {
  color: var(--vp-badge-warning-text);
  background: var(--vp-badge-warning-bg);
}

.changelog-date {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.changelog-card-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.changelog-compare {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-decoration: none;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  transition:
    color 0.2s,
    border-color 0.2s;
}

.changelog-compare:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.changelog-icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  color: var(--vp-c-text-2);
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  transition:
    color 0.2s,
    background 0.2s,
    border-color 0.2s;
}

.changelog-icon-btn:hover {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
  border-color: var(--vp-c-divider);
}

.changelog-icon-btn svg {
  width: 18px;
  height: 18px;
  fill: currentcolor;
}

.changelog-tooltip {
  position: absolute;
  top: 120%;
  right: 0;
  z-index: 10;
  padding: 4px 8px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  opacity: 0;
  transition:
    opacity 0.2s,
    transform 0.2s;
  transform: translateY(-4px);
}

.changelog-icon-btn:hover .changelog-tooltip,
.changelog-icon-btn:focus .changelog-tooltip {
  opacity: 1;
  transform: translateY(0);
}

.changelog-chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--vp-c-text-3);
  transition: transform 0.2s;
}

.changelog-chevron svg {
  width: 20px;
  height: 20px;
  fill: currentcolor;
}

.changelog-release.is-expanded .changelog-chevron {
  transform: rotate(180deg);
}

.changelog-card-body {
  padding: 16px;
  color: var(--vp-c-text-1);
}

.changelog-summary {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.changelog-group + .changelog-group {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--vp-c-divider);
}

.changelog-group-title {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.changelog-group-emoji {
  line-height: 1;
}

.changelog-count {
  padding: 1px 7px;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  border-radius: 999px;
}

.changelog-entries {
  margin: 0;
  padding: 0;
  list-style: none;
}

.changelog-entry {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 6px 0;
  font-size: 15px;
  line-height: 1.5;
  border-bottom: 1px solid transparent;
}

.changelog-entry:last-child {
  border-bottom: none;
}

.changelog-scope {
  padding: 1px 7px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
}

.changelog-scope.scope-release {
  color: var(--vp-badge-danger-text);
  background: var(--vp-badge-danger-bg);
  border-color: transparent;
}

.changelog-scope.scope-action {
  color: var(--vp-badge-info-text);
  background: var(--vp-badge-info-bg);
  border-color: transparent;
}

.changelog-scope.scope-ci,
.changelog-scope.scope-test {
  color: var(--vp-badge-warning-text);
  background: var(--vp-badge-warning-bg);
  border-color: transparent;
}

.changelog-scope.scope-docs {
  color: var(--vp-badge-success-text);
  background: var(--vp-badge-success-bg);
  border-color: transparent;
}

.changelog-message {
  flex: 1;
  color: var(--vp-c-text-1);
}

.changelog-commit {
  display: inline-flex;
  flex-shrink: 0;
  font-size: 12px;
  text-decoration: none;
  transition: opacity 0.2s;
}

.changelog-commit:hover {
  opacity: 0.8;
}

.changelog-commit code {
  padding: 2px 6px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
}

.changelog-author {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  text-decoration: none;
}

.changelog-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.changelog-author-name {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.changelog-author-thanks {
  color: var(--vp-c-text-2);
}

@media (max-width: 640px) {
  .changelog-header {
    flex-direction: column;
  }

  .changelog-search {
    width: 100%;
  }

  .changelog-card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .changelog-card-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .changelog-release {
    gap: 8px;
  }

  .changelog-marker {
    width: 16px;
  }

  .changelog-timeline::before {
    left: 7px;
  }
}
</style>
