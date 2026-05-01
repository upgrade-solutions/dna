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
import { Client, ClientOptions } from './types';
export declare function createClient(options: ClientOptions): Client;
//# sourceMappingURL=client.d.ts.map