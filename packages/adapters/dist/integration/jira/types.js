"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=types.js.map