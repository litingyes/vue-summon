export interface ChangelogEntry {
  message: string
  scope?: string
  hash?: string
  url?: string
  author?: string
  authorAvatar?: string
}

export interface ChangelogGroup {
  key: string
  title: string
  entries: ChangelogEntry[]
}

export interface ChangelogRelease {
  version: string
  rawVersion: string
  date?: string
  compareUrl?: string
  groups: ChangelogGroup[]
}

const GROUP_ORDER = new Map<string, number>([
  ['breaking', 0],
  ['breaking changes', 0],
  ['features', 1],
  ['enhancements', 1],
  ['bug fixes', 2],
  ['fixes', 2],
  ['performance', 3],
  ['perf', 3],
  ['refactor', 4],
  ['refactors', 4],
  ['styles', 5],
  ['docs', 6],
  ['tests', 7],
  ['test', 7],
  ['ci', 8],
  ['chore', 9],
  ['miscellaneous', 10],
  ['contributors', 11],
])

function normalizeGroupKey(title: string): string {
  return title
    .replace(/^[^\w]+/, '')
    .replace(/[^\w\s]/g, '')
    .toLowerCase()
    .trim()
}

function groupOrder(title: string): number {
  return GROUP_ORDER.get(normalizeGroupKey(title)) ?? 50
}

function parseVersionHeading(line: string): { version: string; date?: string } {
  const match = line.trim().match(/^v?(\S+)(?:\s*\(([^)]+)\))?/)
  if (!match) return { version: line.trim() }
  return { version: match[1], date: match[2] }
}

function parseEntry(line: string, groupTitle: string): ChangelogEntry | null {
  const trimmed = line.trim()
  if (!trimmed.startsWith('- ')) return null

  const content = trimmed.slice(2)

  const linkMatch = content.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)\s*\)?\s*$/)
  if (!linkMatch) {
    return { message: content }
  }

  const linkText = linkMatch[1]
  const url = linkMatch[2]
  let message = content
    .slice(0, content.lastIndexOf(linkMatch[0]))
    .trim()
    .replace(/\s*\($/, '')

  const scopeMatch = message.match(/^\*\*([^:*]+):\*\*\s*(.*)$/)

  const isContributor = normalizeGroupKey(groupTitle) === 'contributors'
  if (isContributor) {
    const username = url.split('/').pop() || linkText.replace(/^@/, '')
    return {
      message: message.replace(/^\*\*[^:*]+:\*\*\s*/, '').trim() || message,
      author: username,
      authorAvatar: `https://github.com/${username}.png`,
      url,
    }
  }

  const entry: ChangelogEntry = {
    message: scopeMatch ? scopeMatch[2] : message,
    url,
  }

  if (scopeMatch) {
    entry.scope = scopeMatch[1]
  }

  if (/^[a-f0-9]{7,40}$/i.test(linkText)) {
    entry.hash = linkText.slice(0, 7)
  } else {
    entry.hash = linkText
  }

  return entry
}

function parseRelease(body: string): Omit<ChangelogRelease, 'version' | 'rawVersion'> {
  const lines = body.split('\n')
  let compareUrl: string | undefined
  let cursor = 0

  if (lines[0]?.trim().startsWith('[')) {
    const compareMatch = lines[0].match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/)
    if (compareMatch) {
      compareUrl = compareMatch[2]
      cursor = 1
    }
  }

  const groups: ChangelogGroup[] = []
  let currentGroup: ChangelogGroup | null = null

  for (let i = cursor; i < lines.length; i++) {
    const line = lines[i]
    const groupMatch = line.match(/^### (.+)$/)

    if (groupMatch) {
      currentGroup = {
        key: normalizeGroupKey(groupMatch[1]),
        title: groupMatch[1].trim(),
        entries: [],
      }
      groups.push(currentGroup)
      continue
    }

    if (currentGroup) {
      const entry = parseEntry(line, currentGroup.title)
      if (entry) {
        currentGroup.entries.push(entry)
      }
    }
  }

  groups.sort((a, b) => groupOrder(a.title) - groupOrder(b.title))

  return { compareUrl, groups }
}

export function parseChangelog(content: string): ChangelogRelease[] {
  const releases: ChangelogRelease[] = []
  const matches = Array.from(content.matchAll(/^## (.+)$/gm))

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    const heading = match[1]
    const startIndex = match.index + match[0].length + 1
    const endIndex = i + 1 < matches.length ? matches[i + 1].index : content.length

    const body = content.slice(startIndex, endIndex).trim()
    const { version, date } = parseVersionHeading(heading)

    releases.push({
      version,
      rawVersion: heading,
      date,
      ...parseRelease(body),
    })
  }

  return releases
}
