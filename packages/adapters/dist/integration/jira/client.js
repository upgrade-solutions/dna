"use strict";
/**
 * Jira Cloud REST v3 client.
 *
 * - Basic auth: `Authorization: Basic <base64(email:apiToken)>`
 * - Uses global fetch; no SDK.
 * - Pure I/O: implements `Integration` from `@dna-codes/dna-ingest`. No
 *   knowledge of DNA, parsing, or rendering — composition lives in the
 *   caller (e.g. `src/cli.ts`).
 *
 * Transport lives here. ADF conversion lives in `adf.ts`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = createClient;
const adf_1 = require("./adf");
const DEFAULT_USER_AGENT = '@dna-codes/dna-integration-jira';
const DEFAULT_STORY_ISSUE_TYPE = 'Story';
const DEFAULT_EPIC_LINK_MODE = 'auto';
const EPIC_LINK_FIELD = 'customfield_10014';
function createClient(options) {
    if (!options.baseUrl)
        throw new Error('integration-jira: options.baseUrl is required.');
    if (!options.email)
        throw new Error('integration-jira: options.email is required.');
    if (!options.apiToken)
        throw new Error('integration-jira: options.apiToken is required.');
    if (!options.projectKey)
        throw new Error('integration-jira: options.projectKey is required.');
    const fetchImpl = options.fetchImpl ?? fetch;
    const userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
    const storyIssueType = options.storyIssueType ?? DEFAULT_STORY_ISSUE_TYPE;
    const epicLinkMode = options.epicLinkMode ?? DEFAULT_EPIC_LINK_MODE;
    const base = options.baseUrl.replace(/\/$/, '');
    const authHeader = `Basic ${Buffer.from(`${options.email}:${options.apiToken}`).toString('base64')}`;
    async function request(path, init = {}) {
        const res = await fetchImpl(`${base}${path}`, {
            ...init,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                'user-agent': userAgent,
                authorization: authHeader,
                ...(init.headers ?? {}),
            },
        });
        if (!res.ok) {
            const body = await res.text().catch(() => '');
            throw new Error(`integration-jira: ${init.method ?? 'GET'} ${path} → ${res.status} ${body}`);
        }
        if (res.status === 204)
            return undefined;
        return (await res.json());
    }
    async function getEpic(key) {
        return request(`/rest/api/3/issue/${encodeURIComponent(key)}`);
    }
    function extractEpicText(epic) {
        const summary = epic.fields.summary ?? '';
        const body = (0, adf_1.extractText)(epic.fields.description);
        return [summary, body].filter(Boolean).join('\n\n').trim();
    }
    async function createIssue(fields) {
        return request('/rest/api/3/issue', {
            method: 'POST',
            body: JSON.stringify({ fields }),
        });
    }
    async function updateIssue(key, fields) {
        await request(`/rest/api/3/issue/${encodeURIComponent(key)}`, {
            method: 'PUT',
            body: JSON.stringify({ fields }),
        });
    }
    async function searchIssues(jql, fields = ['summary', 'labels']) {
        // Newer Jira Cloud uses POST /rest/api/3/search/jql; older sites expose
        // GET /rest/api/3/search. POST form accepts the same payload on both.
        return request('/rest/api/3/search/jql', {
            method: 'POST',
            body: JSON.stringify({ jql, fields, maxResults: 100 }),
        });
    }
    async function searchChildrenByDnaLabel(epicKey) {
        const children = await searchIssues(`parent = ${epicKey}`, ['summary', 'labels']);
        // Index each child by every plausible key:
        //   - exact `dna:<id>` suffix
        //   - suffix with `capability-` prefix stripped (legacy matching)
        const byKey = new Map();
        for (const issue of children.issues) {
            for (const label of issue.fields.labels ?? []) {
                if (!label.startsWith('dna:'))
                    continue;
                const suffix = label.slice(4);
                byKey.set(suffix, issue.key);
                if (suffix.startsWith('capability-')) {
                    byKey.set(suffix.slice('capability-'.length), issue.key);
                }
                else {
                    byKey.set(`capability-${suffix}`, issue.key);
                }
            }
        }
        return byKey;
    }
    // ── Integration: fetch / write ─────────────────────────────────────────
    function parseJiraUri(uri) {
        // Matches `jira://<KEY>` and `jira:child://<KEY>`. Other shapes throw.
        const m = /^jira(?::([a-z][a-z0-9-]*))?:\/\/([^?#]+)(\?.*)?$/i.exec(uri);
        if (!m)
            throw new Error(`integration-jira: unrecognized URI shape: ${uri}`);
        const sub = m[1];
        const key = decodeURIComponent(m[2]);
        const query = new URLSearchParams(m[3] ?? '');
        if (!sub)
            return { mode: 'issue', key, query };
        if (sub === 'child')
            return { mode: 'child', key, query };
        throw new Error(`integration-jira: unsupported sub-scheme 'jira:${sub}'`);
    }
    async function fetchUri(uri) {
        const parsed = parseJiraUri(uri);
        if (parsed.mode !== 'issue') {
            throw new Error(`integration-jira: fetch only supports 'jira://<KEY>' (got ${uri})`);
        }
        const epic = await getEpic(parsed.key);
        const text = extractEpicText(epic);
        return {
            contents: text,
            mimeType: 'text/markdown',
            source: { uri, loadedAt: new Date().toISOString() },
        };
    }
    function payloadAsString(payload) {
        if (payload.mimeType !== 'text/markdown') {
            throw new Error(`integration-jira: write payload mimeType must be 'text/markdown' (got '${payload.mimeType}')`);
        }
        return typeof payload.contents === 'string'
            ? payload.contents
            : payload.contents.toString('utf-8');
    }
    async function writeUri(target, payload) {
        const parsed = parseJiraUri(target);
        const description = (0, adf_1.fromMarkdown)(payloadAsString(payload));
        const summary = parsed.query.get('summary') ?? undefined;
        const dnaLabel = parsed.query.get('label') ?? undefined;
        const extraLabels = parsed.query.getAll('extra-label');
        if (parsed.mode === 'child') {
            if (!summary) {
                throw new Error(`integration-jira: 'jira:child://<EPIC>' write requires a 'summary' query param`);
            }
            const labels = [];
            if (dnaLabel)
                labels.push(`dna:${dnaLabel}`);
            labels.push(...extraLabels);
            const fields = {
                summary,
                description,
                issuetype: { name: storyIssueType },
                project: { key: options.projectKey },
                labels,
            };
            if (epicLinkMode === 'parent' || epicLinkMode === 'auto') {
                fields.parent = { key: parsed.key };
            }
            if (epicLinkMode === 'epic-link' || epicLinkMode === 'auto') {
                fields[EPIC_LINK_FIELD] = parsed.key;
            }
            const created = await createIssue(fields);
            return {
                target: `jira://${created.key}`,
                meta: { id: created.id, summary, parent: parsed.key },
            };
        }
        // mode === 'issue' — PUT update on parsed.key.
        const updateFields = { description };
        if (summary)
            updateFields.summary = summary;
        if (dnaLabel) {
            // Replace any existing dna:* label with the new one; preserve everything else.
            const existing = await getEpic(parsed.key).catch(() => null);
            const preserved = (existing?.fields.labels ?? []).filter((l) => !l.startsWith('dna:'));
            updateFields.labels = [`dna:${dnaLabel}`, ...preserved, ...extraLabels];
        }
        else if (extraLabels.length) {
            const existing = await getEpic(parsed.key).catch(() => null);
            updateFields.labels = [...(existing?.fields.labels ?? []), ...extraLabels];
        }
        await updateIssue(parsed.key, updateFields);
        return {
            target: `jira://${parsed.key}`,
            meta: summary ? { summary } : {},
        };
    }
    return {
        fetch: fetchUri,
        write: writeUri,
        getEpic,
        extractEpicText,
        searchChildrenByDnaLabel,
        createIssue,
        updateIssue,
        searchIssues,
    };
}
//# sourceMappingURL=client.js.map