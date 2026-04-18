/**
 * Jira Cloud REST v3 client.
 *
 * - Basic auth: `Authorization: Basic <base64(email:apiToken)>`
 * - Uses global fetch; no SDK.
 * - Runtime deps: @dna-codes/input-text (epic description → DNA) and
 *   @dna-codes/output-text (DNA → per-capability Story prose). These are
 *   legitimate runtime deps — the integration's whole purpose is to wire
 *   them into a real system.
 *
 * Transport lives here. Semantic translation lives in mapping.ts; ADF
 * conversion lives in adf.ts.
 */

import { parse as parseText } from '@dna-codes/input-text'
import { renderMany, Style } from '@dna-codes/output-text'

import { extractText, fromMarkdown } from './adf'
import { dnaToStoryFields } from './mapping'
import {
  Client,
  ClientOptions,
  CreateIssueResponse,
  DnaInput,
  JiraIssue,
  JiraIssueFields,
  JiraSearchResponse,
  PullEpicOptions,
  PushStoriesOptions,
  PushStoriesResult,
  UpdateStoriesResult,
} from './types'

const DEFAULT_USER_AGENT = '@dna-codes/integration-jira'
const DEFAULT_STORY_ISSUE_TYPE = 'Story'

export function createClient(options: ClientOptions): Client {
  if (!options.baseUrl) throw new Error('integration-jira: options.baseUrl is required.')
  if (!options.email) throw new Error('integration-jira: options.email is required.')
  if (!options.apiToken) throw new Error('integration-jira: options.apiToken is required.')
  if (!options.projectKey) throw new Error('integration-jira: options.projectKey is required.')

  const fetchImpl = options.fetchImpl ?? fetch
  const userAgent = options.userAgent ?? DEFAULT_USER_AGENT
  const storyIssueType = options.storyIssueType ?? DEFAULT_STORY_ISSUE_TYPE
  const base = options.baseUrl.replace(/\/$/, '')
  const authHeader = `Basic ${Buffer.from(`${options.email}:${options.apiToken}`).toString('base64')}`

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetchImpl(`${base}${path}`, {
      ...init,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'user-agent': userAgent,
        authorization: authHeader,
        ...(init.headers ?? {}),
      },
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(
        `integration-jira: ${init.method ?? 'GET'} ${path} → ${res.status} ${body}`,
      )
    }
    if (res.status === 204) return undefined as T
    return (await res.json()) as T
  }

  async function getEpic(key: string): Promise<JiraIssue> {
    return request<JiraIssue>(`/rest/api/3/issue/${encodeURIComponent(key)}`)
  }

  function extractEpicText(epic: JiraIssue): string {
    const summary = epic.fields.summary ?? ''
    const body = extractText(epic.fields.description)
    return [summary, body].filter(Boolean).join('\n\n').trim()
  }

  async function pullDnaFromEpic(
    key: string,
    pullOptions: PullEpicOptions,
  ): Promise<DnaInput> {
    const epic = await getEpic(key)
    const text = extractEpicText(epic)
    if (!text) {
      throw new Error(`integration-jira: epic ${key} has no summary or description to parse.`)
    }
    const { raw, ...dna } = await parseText(text, {
      provider: pullOptions.provider,
      apiKey: pullOptions.apiKey,
      ...(pullOptions.model ? { model: pullOptions.model } : {}),
      ...(pullOptions.baseUrl ? { baseUrl: pullOptions.baseUrl } : {}),
      ...(pullOptions.instructions ? { instructions: pullOptions.instructions } : {}),
    })
    void raw
    return dna as DnaInput
  }

  async function createIssue(fields: JiraIssueFields): Promise<CreateIssueResponse> {
    return request<CreateIssueResponse>('/rest/api/3/issue', {
      method: 'POST',
      body: JSON.stringify({ fields }),
    })
  }

  async function updateIssue(key: string, fields: Partial<JiraIssueFields>): Promise<void> {
    await request<void>(`/rest/api/3/issue/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ fields }),
    })
  }

  async function searchIssues(
    jql: string,
    fields: string[] = ['summary', 'labels'],
  ): Promise<JiraSearchResponse> {
    // Newer Jira Cloud uses POST /rest/api/3/search/jql; older sites expose
    // GET /rest/api/3/search. POST form accepts the same payload on both.
    return request<JiraSearchResponse>('/rest/api/3/search/jql', {
      method: 'POST',
      body: JSON.stringify({ jql, fields, maxResults: 100 }),
    })
  }

  async function updateStoriesUnderEpic(
    key: string,
    dna: DnaInput,
    style: Style = 'user-story',
  ): Promise<UpdateStoriesResult> {
    const docs = renderMany(dna as never, { styles: { capability: style } })
    if (!docs.length) return { epicKey: key, updated: [], skipped: [] }

    // Fetch every child of the epic — avoids JQL gymnastics and lets us
    // match existing Stories whose labels use older id schemes
    // (pre-unit-prefix: `dna:claimant-submit`) as well as the current
    // `dna:capability-claimant-submit`.
    const children = await searchIssues(`parent = ${key}`, ['summary', 'labels'])

    // Index each child by every plausible key:
    //   - exact `dna:<id>` suffix
    //   - suffix with `capability-` prefix stripped (legacy matching)
    const byKey = new Map<string, string>()
    for (const issue of children.issues) {
      for (const label of issue.fields.labels ?? []) {
        if (!label.startsWith('dna:')) continue
        const suffix = label.slice(4)
        byKey.set(suffix, issue.key)
        if (suffix.startsWith('capability-')) {
          byKey.set(suffix.slice('capability-'.length), issue.key)
        } else {
          byKey.set(`capability-${suffix}`, issue.key)
        }
      }
    }

    const updated: UpdateStoriesResult['updated'] = []
    const skipped: UpdateStoriesResult['skipped'] = []
    for (const doc of docs) {
      const issueKey = byKey.get(doc.id)
      if (!issueKey) {
        skipped.push({ id: doc.id, reason: 'no child issue with matching dna label' })
        continue
      }
      // Rewrite labels: drop any `dna:*` label, add the canonical `dna:<doc.id>`.
      // Keeps legacy labels from piling up alongside new ones.
      const existing = children.issues.find((i) => i.key === issueKey)
      const nonDna = (existing?.fields.labels ?? []).filter((l) => !l.startsWith('dna:'))
      await updateIssue(issueKey, {
        summary: doc.title,
        description: fromMarkdown(doc.body),
        labels: [`dna:${doc.id}`, ...nonDna],
      })
      updated.push({ key: issueKey, summary: doc.title })
    }
    return { epicKey: key, updated, skipped }
  }

  async function pushStoriesToEpic(
    key: string,
    dna: DnaInput,
    pushOptions: PushStoriesOptions = {},
  ): Promise<PushStoriesResult> {
    const issueType = pushOptions.issueType ?? storyIssueType
    const stories = dnaToStoryFields(dna, {
      projectKey: options.projectKey,
      epicKey: key,
      issueType,
      ...(pushOptions.labels ? { labels: pushOptions.labels } : {}),
      ...(pushOptions.epicLinkMode ? { epicLinkMode: pushOptions.epicLinkMode } : {}),
      ...(pushOptions.style ? { style: pushOptions.style } : {}),
    })

    if (pushOptions.dryRun) {
      return {
        epicKey: key,
        created: [],
        planned: stories.map((s) => ({
          summary: s.summary,
          description: typeof s.description === 'string'
            ? s.description
            : extractText(s.description),
        })),
      }
    }

    const created: PushStoriesResult['created'] = []
    for (const fields of stories) {
      const adfFields: JiraIssueFields = {
        ...fields,
        description: typeof fields.description === 'string'
          ? fromMarkdown(fields.description)
          : fields.description,
      }
      const res = await createIssue(adfFields)
      created.push({ id: res.id, key: res.key, summary: fields.summary })
    }
    return { epicKey: key, created }
  }

  return {
    getEpic,
    extractEpicText,
    pullDnaFromEpic,
    pushStoriesToEpic,
    updateStoriesUnderEpic,
    createIssue,
    updateIssue,
    searchIssues,
  }
}
