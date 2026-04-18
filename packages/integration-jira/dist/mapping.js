"use strict";
/**
 * DNA ⇄ Jira field mapping.
 *
 * One Capability → one Story. `@dna-codes/output-text` renders the per-unit
 * `{id, title, body}` shape, and we translate those into Jira `fields`
 * payloads. The description remains a plain string here — transport layer
 * wraps it in ADF on the way out.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dnaToStoryFields = dnaToStoryFields;
const output_text_1 = require("@dna-codes/output-text");
const EPIC_LINK_FIELD = 'customfield_10014';
function dnaToStoryFields(dna, options) {
    const docs = (0, output_text_1.renderMany)(dna, {
        styles: { capability: options.style ?? 'user-story' },
    });
    const mode = options.epicLinkMode ?? 'auto';
    return docs.map((doc) => {
        const fields = {
            summary: doc.title,
            description: doc.body,
            issuetype: { name: options.issueType },
            project: { key: options.projectKey },
        };
        if (mode === 'parent' || mode === 'auto') {
            fields.parent = { key: options.epicKey };
        }
        if (mode === 'epic-link' || mode === 'auto') {
            fields[EPIC_LINK_FIELD] = options.epicKey;
        }
        fields.labels = [`dna:${doc.id}`, ...(options.labels ?? [])];
        return fields;
    });
}
//# sourceMappingURL=mapping.js.map