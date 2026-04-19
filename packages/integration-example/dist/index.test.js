"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const client_1 = require("./client");
const mapping_1 = require("./mapping");
const webhook_1 = require("./webhook");
function mockFetch(handler) {
    const calls = [];
    const fetchImpl = (async (url, init) => {
        const u = String(url);
        const i = init ?? {};
        calls.push({ url: u, init: i });
        const { status = 200, body } = handler(u, i);
        return {
            ok: status >= 200 && status < 300,
            status,
            json: async () => body,
            text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
        };
    });
    return { fetchImpl, calls };
}
describe('mapping', () => {
    it('maps external items to DNA Resources with PascalCase names', () => {
        const dna = (0, mapping_1.itemsToDna)([{ id: 'i1', title: 'loan application', tags: ['a', 'b'] }], 'acme.ops');
        const [resource] = dna.operational.domain.resources;
        expect(resource.name).toBe('LoanApplication');
        expect(resource.metadata?.externalId).toBe('i1');
        expect(resource.metadata?.tags).toEqual(['a', 'b']);
    });
    it('round-trips Resources through dnaToItems', () => {
        const dna = (0, mapping_1.itemsToDna)([{ id: 'i1', title: 'Loan', description: 'x' }], 'acme.ops');
        const [out] = (0, mapping_1.dnaToItems)(dna);
        expect(out.title).toBe('Loan');
        expect(out.description).toBe('x');
    });
});
describe('client', () => {
    it('sends Bearer auth and paginates via nextCursor', async () => {
        const { fetchImpl, calls } = mockFetch((url) => {
            if (url.endsWith('/items')) {
                return { body: { items: [{ id: 'a', title: 'First' }], nextCursor: 'c2' } };
            }
            return { body: { items: [{ id: 'b', title: 'Second' }] } };
        });
        const client = (0, client_1.createClient)({ baseUrl: 'https://api.example.com/', apiToken: 'tok', fetchImpl });
        const dna = await client.pullDna();
        expect(calls).toHaveLength(2);
        expect(calls[0].init.headers.authorization).toBe('Bearer tok');
        expect(calls[1].url).toContain('cursor=c2');
        expect(dna.operational?.domain.resources?.map((r) => r.name)).toEqual(['First', 'Second']);
    });
    it('pushDna creates an item per Resource', async () => {
        const { fetchImpl, calls } = mockFetch((_url, init) => {
            const body = JSON.parse(init.body);
            return { body: { id: 'new', ...body } };
        });
        const client = (0, client_1.createClient)({ baseUrl: 'https://api.example.com', apiToken: 'tok', fetchImpl });
        const { created } = await client.pushDna({
            operational: {
                domain: { name: 'ops', resources: [{ name: 'Alpha' }, { name: 'Beta' }] },
            },
        });
        expect(created).toBe(2);
        expect(calls.every((c) => c.init.method === 'POST')).toBe(true);
    });
    it('throws on non-2xx responses', async () => {
        const { fetchImpl } = mockFetch(() => ({ status: 500, body: 'boom' }));
        const client = (0, client_1.createClient)({ baseUrl: 'https://api.example.com', apiToken: 't', fetchImpl });
        await expect(client.listItems()).rejects.toThrow(/500/);
    });
    it('throws when baseUrl or apiToken is missing', () => {
        expect(() => (0, client_1.createClient)({ baseUrl: '', apiToken: 't' })).toThrow(/baseUrl/);
        expect(() => (0, client_1.createClient)({ baseUrl: 'x', apiToken: '' })).toThrow(/apiToken/);
    });
});
describe('webhook', () => {
    const secret = 'shh';
    const body = JSON.stringify({
        type: 'item.created',
        item: { id: 'i1', title: 'Hi' },
        occurredAt: '2026-04-18T00:00:00Z',
    });
    const sig = (0, crypto_1.createHmac)('sha256', secret).update(body, 'utf8').digest('hex');
    it('verifies a correct signature', () => {
        expect((0, webhook_1.verifySignature)(body, sig, secret)).toBe(true);
        expect((0, webhook_1.verifySignature)(body, `sha256=${sig}`, secret)).toBe(true);
    });
    it('rejects a wrong signature', () => {
        expect((0, webhook_1.verifySignature)(body, 'deadbeef', secret)).toBe(false);
        expect((0, webhook_1.verifySignature)(body, undefined, secret)).toBe(false);
    });
    it('parses a valid webhook', () => {
        const event = (0, webhook_1.parseWebhook)(body, { 'x-example-signature': sig }, { secret });
        expect(event.type).toBe('item.created');
        expect(event.item.id).toBe('i1');
    });
    it('throws 401 on bad signature', () => {
        expect(() => (0, webhook_1.parseWebhook)(body, { 'x-example-signature': 'bad' }, { secret })).toThrow(webhook_1.WebhookError);
    });
    it('throws 400 on malformed body', () => {
        const badBody = 'not-json';
        const badSig = (0, crypto_1.createHmac)('sha256', secret).update(badBody, 'utf8').digest('hex');
        try {
            (0, webhook_1.parseWebhook)(badBody, { 'x-example-signature': badSig }, { secret });
            fail('expected throw');
        }
        catch (err) {
            expect(err).toBeInstanceOf(webhook_1.WebhookError);
            expect(err.status).toBe(400);
        }
    });
});
//# sourceMappingURL=index.test.js.map