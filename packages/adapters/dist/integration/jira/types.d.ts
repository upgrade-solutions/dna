/**
 * Types for the Jira integration.
 *
 * Jira's REST v3 returns rich records; we model only the fields actually
 * read or written. Descriptions come back as Atlassian Document Format
 * (ADF); we accept a plain string for authoring convenience and convert
 * on the way out.
 *
 * The integration is pure I/O — no DNA-shaped types appear on its public
 * surface. Composition (Epic→DNA→Stories) is the caller's concern.
 */
import type { FetchResult, WritePayload, WriteResult } from '@dna-codes/dna-ingest';
/** ADF node — we produce doc/paragraph/bulletList/listItem/text/hardBreak with marks. */
export interface AdfMark {
    type: 'strong' | 'em' | 'code' | string;
    attrs?: Record<string, unknown>;
}
export interface AdfNode {
    type: string;
    content?: AdfNode[];
    text?: string;
    attrs?: Record<string, unknown>;
    marks?: AdfMark[];
    /** Present only on the root `doc` node per the ADF spec. */
    version?: number;
}
export interface JiraIssueFields {
    summary: string;
    description?: AdfNode | string | null;
    issuetype?: {
        name?: string;
        id?: string;
    };
    project?: {
        key?: string;
        id?: string;
    };
    parent?: {
        key: string;
    };
    /** Jira Cloud "next-gen" parent link for Stories under an Epic. */
    customfield_10014?: string;
    labels?: string[];
}
export interface JiraIssue {
    id: string;
    key: string;
    self?: string;
    fields: JiraIssueFields;
}
export interface JiraSearchResponse {
    issues: JiraIssue[];
    nextPageToken?: string;
    isLast?: boolean;
}
export interface CreateIssueResponse {
    id: string;
    key: string;
    self: string;
}
/**
 * How the client links a newly created child Story to its parent Epic.
 * Jira Cloud's two project types use different mechanisms:
 *
 *   - `parent`     team-managed projects (default for new Cloud sites). Modern.
 *   - `epic-link`  company-managed projects, via `customfield_10014`.
 *   - `auto`       (default) sends both fields; Jira ignores the one it doesn't understand.
 */
export type EpicLinkMode = 'auto' | 'parent' | 'epic-link';
export interface ClientOptions {
    /** Cloud site base URL, e.g. https://acme.atlassian.net */
    baseUrl: string;
    /** Atlassian account email — used with apiToken for Basic auth. */
    email: string;
    /** Atlassian API token (not a password). */
    apiToken: string;
    /** Jira project key, e.g. 'ENG'. Required to create Stories. */
    projectKey: string;
    /** Issue type name for generated children. Default: 'Story'. */
    storyIssueType?: string;
    /** How `write()` links new children to their Epic. Default: 'auto'. */
    epicLinkMode?: EpicLinkMode;
    /** Override user-agent. */
    userAgent?: string;
    /** Inject a fetch implementation — mainly for tests. */
    fetchImpl?: typeof fetch;
}
/**
 * Implements `Integration` from `@dna-codes/dna-ingest`. The client is bytes
 * in, bytes out: callers compose with `@dna-codes/dna-input-text` and
 * `@dna-codes/dna-output-text` (or any equivalent) to convert between Epic
 * prose and DNA.
 *
 * Two URI shapes are accepted by `write`:
 *
 *   - `jira://<KEY>?summary=<title>&label=<id>`
 *       PUT update onto issue `<KEY>`. `summary` and `label` are optional;
 *       `label` (when present) replaces any existing `dna:*` label.
 *
 *   - `jira:child://<EPIC>?summary=<title>&label=<id>`
 *       POST a new child issue under Epic `<EPIC>`. `summary` is required;
 *       `label` (when present) becomes the issue's `dna:<label>` tag.
 *
 * Both URI shapes accept multiple `extra-label=<value>` query params for
 * additional Story labels.
 */
export interface Client {
    /** `Integration.fetch` — `jira://<KEY>` returns the issue's normalized prose. */
    fetch(uri: string): Promise<FetchResult>;
    /** `Integration.write` — see the URI-shape documentation on `Client`. */
    write(target: string, payload: WritePayload): Promise<WriteResult>;
    /** Fetch a single issue's raw Jira payload. */
    getEpic(key: string): Promise<JiraIssue>;
    /** Extract prose text from an issue's description (ADF or plain). */
    extractEpicText(epic: JiraIssue): string;
    /**
     * Walk the children of `epicKey` and return a `dna:<id>` → issue-key map.
     * Handles legacy aliasing: a child labeled `dna:capability-x` is indexed
     * under both `capability-x` and `x` so older and newer label schemes
     * resolve to the same Story.
     */
    searchChildrenByDnaLabel(epicKey: string): Promise<Map<string, string>>;
    /** Raw issue create — escape hatch. */
    createIssue(fields: JiraIssueFields): Promise<CreateIssueResponse>;
    /** Raw issue update (PUT /rest/api/3/issue/<key>). */
    updateIssue(key: string, fields: Partial<JiraIssueFields>): Promise<void>;
    /** JQL-backed search (POST /rest/api/3/search/jql on newer Jira Cloud). */
    searchIssues(jql: string, fields?: string[]): Promise<JiraSearchResponse>;
}
//# sourceMappingURL=types.d.ts.map