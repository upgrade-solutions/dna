/**
 * Outbound API client for the external system.
 *
 * Uses global fetch (Node 18+) — no SDK. Add provider-specific logic here:
 * auth flow, pagination, rate-limit handling, retry policy, API versioning.
 *
 * The client exposes two high-level helpers on top of the raw HTTP methods:
 *   - pullDna() — fetch everything and convert to DNA
 *   - pushDna() — convert DNA and push each record
 *
 * Keep HTTP concerns here; keep semantic translation in mapping.ts.
 */
import { Client, ClientOptions } from './types';
export declare function createClient(options: ClientOptions): Client;
//# sourceMappingURL=client.d.ts.map