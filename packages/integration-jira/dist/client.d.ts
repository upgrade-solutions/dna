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
import { Client, ClientOptions } from './types';
export declare function createClient(options: ClientOptions): Client;
//# sourceMappingURL=client.d.ts.map