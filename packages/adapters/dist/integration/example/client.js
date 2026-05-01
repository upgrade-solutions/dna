"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = createClient;
const mapping_1 = require("./mapping");
const DEFAULT_USER_AGENT = '@dna-codes/dna-integration-example (template)';
function createClient(options) {
    if (!options.baseUrl)
        throw new Error('integration-example: options.baseUrl is required.');
    if (!options.apiToken)
        throw new Error('integration-example: options.apiToken is required.');
    const fetchImpl = options.fetchImpl ?? fetch;
    const userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
    const base = options.baseUrl.replace(/\/$/, '');
    async function request(path, init = {}) {
        const res = await fetchImpl(`${base}${path}`, {
            ...init,
            headers: {
                'content-type': 'application/json',
                'user-agent': userAgent,
                authorization: `Bearer ${options.apiToken}`,
                ...(init.headers ?? {}),
            },
        });
        if (!res.ok) {
            const body = await res.text().catch(() => '');
            throw new Error(`integration-example: ${init.method ?? 'GET'} ${path} → ${res.status} ${body}`);
        }
        return (await res.json());
    }
    async function listItems({ cursor } = {}) {
        const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
        return request(`/items${query}`);
    }
    async function createItem(item) {
        return request('/items', {
            method: 'POST',
            body: JSON.stringify(item),
        });
    }
    async function pullDna() {
        const all = [];
        let cursor;
        do {
            const page = await listItems({ cursor });
            all.push(...page.items);
            cursor = page.nextCursor;
        } while (cursor);
        const domain = deriveDomain(options.baseUrl);
        return (0, mapping_1.itemsToDna)(all, domain);
    }
    async function pushDna(dna) {
        const items = (0, mapping_1.dnaToItems)(dna);
        let created = 0;
        for (const item of items) {
            await createItem(item);
            created++;
        }
        return { created };
    }
    return { listItems, createItem, pullDna, pushDna };
}
function deriveDomain(baseUrl) {
    try {
        const host = new URL(baseUrl).host;
        return host.replace(/[^a-z0-9]+/gi, '.').toLowerCase();
    }
    catch {
        return 'external';
    }
}
//# sourceMappingURL=client.js.map