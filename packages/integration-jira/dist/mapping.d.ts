/**
 * DNA ⇄ Jira field mapping.
 *
 * One Capability → one Story. `@dna-codes/output-text` renders the per-unit
 * `{id, title, body}` shape, and we translate those into Jira `fields`
 * payloads. The description remains a plain string here — transport layer
 * wraps it in ADF on the way out.
 */
import { Style } from '@dna-codes/output-text';
import { DnaInput, JiraIssueFields } from './types';
export type CapabilityStyle = Style;
/**
 * How to link a child Story to an Epic. Jira Cloud's two project types
 * use different mechanisms:
 *
 *   - `parent`  — team-managed projects (the default for new Cloud sites).
 *                 Works for any child type; modern, recommended by Atlassian.
 *   - `epic-link` — company-managed projects, via `customfield_10014`.
 *
 * `auto` sends BOTH fields; Jira accepts the one it understands and
 * silently ignores the other. This is the simplest robust default. Set
 * an explicit mode only if auto trips validation on your site.
 */
export type EpicLinkMode = 'auto' | 'parent' | 'epic-link';
export interface DnaToStoryOptions {
    projectKey: string;
    epicKey: string;
    issueType: string;
    labels?: string[];
    epicLinkMode?: EpicLinkMode;
    /** Body style applied to each Capability. Default: 'user-story'. */
    style?: CapabilityStyle;
}
export declare function dnaToStoryFields(dna: DnaInput, options: DnaToStoryOptions): JiraIssueFields[];
//# sourceMappingURL=mapping.d.ts.map