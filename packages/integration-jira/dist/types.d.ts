/**
 * Types for the Jira integration.
 *
 * Jira's REST v3 returns rich records; we model only the fields actually
 * read or written. Descriptions come back as Atlassian Document Format
 * (ADF); we accept a plain string for authoring convenience and convert
 * on the way out.
 */
import type { ParseResult } from '@dna-codes/dna-input-text';
import type { Style } from '@dna-codes/dna-output-text';
/**
 * The DNA shape consumed and emitted by this integration. Matches the
 * layer fields `@dna-codes/dna-input-text` returns (minus transport metadata
 * `raw` and `missingLayers`) and the fields `@dna-codes/dna-output-text` reads.
 */
export type DnaInput = Omit<ParseResult, 'raw' | 'missingLayers'>;
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
    /** Override user-agent. */
    userAgent?: string;
    /** Inject a fetch implementation — mainly for tests. */
    fetchImpl?: typeof fetch;
}
export interface PullEpicOptions {
    /** LLM provider — passed through to @dna-codes/dna-input-text. */
    provider: 'openai' | 'openrouter' | 'anthropic';
    apiKey: string;
    model?: string;
    baseUrl?: string;
    /** Extra guidance appended to input-text's system prompt. */
    instructions?: string;
}
export interface PushStoriesOptions {
    /** Additional labels applied to every created Story. */
    labels?: string[];
    /** Override the issue type set at client creation. */
    issueType?: string;
    /**
     * How to link child Stories to the Epic.
     *   - 'auto' (default) sends both `parent` and `customfield_10014`; Jira picks the one it understands.
     *   - 'parent' sends only `parent.key` — correct for team-managed projects.
     *   - 'epic-link' sends only `customfield_10014` — correct for company-managed projects.
     */
    epicLinkMode?: 'auto' | 'parent' | 'epic-link';
    /** Body style for each Capability Story: user-story | gherkin | product-dna. */
    style?: Style;
    /** Dry run — skip the POST calls and return what would have been sent. */
    dryRun?: boolean;
}
export interface PushStoriesResult {
    epicKey: string;
    created: Array<{
        id: string;
        key: string;
        summary: string;
    }>;
    /** Populated only when `dryRun` is true. */
    planned?: Array<{
        summary: string;
        description: string;
    }>;
}
export interface UpdateStoriesResult {
    epicKey: string;
    updated: Array<{
        key: string;
        summary: string;
    }>;
    skipped: Array<{
        id: string;
        reason: string;
    }>;
}
export interface Client {
    /** Fetch a single Epic and return its raw Jira payload. */
    getEpic(key: string): Promise<JiraIssue>;
    /** Extract prose text from an Epic's description (ADF or plain). */
    extractEpicText(epic: JiraIssue): string;
    /** Run the full epic → input-text → DNA pipeline. */
    pullDnaFromEpic(key: string, options: PullEpicOptions): Promise<DnaInput>;
    /** Create one child Story per DNA Capability under the named Epic. */
    pushStoriesToEpic(key: string, dna: DnaInput, options?: PushStoriesOptions): Promise<PushStoriesResult>;
    /**
     * Update the descriptions of existing `dna:<id>`-labeled child Stories
     * under the Epic so re-renders stay in place (idempotent re-push).
     */
    updateStoriesUnderEpic(key: string, dna: DnaInput, style?: Style): Promise<UpdateStoriesResult>;
    /** Raw issue create — escape hatch. */
    createIssue(fields: JiraIssueFields): Promise<CreateIssueResponse>;
    /** Raw issue update (PUT /rest/api/3/issue/<key>). */
    updateIssue(key: string, fields: Partial<JiraIssueFields>): Promise<void>;
    /** JQL-backed search (POST /rest/api/3/search/jql on newer Jira Cloud). */
    searchIssues(jql: string, fields?: string[]): Promise<JiraSearchResponse>;
}
//# sourceMappingURL=types.d.ts.map