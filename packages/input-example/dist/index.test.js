"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const sample = {
    entities: [
        {
            name: 'loan',
            fields: [
                { name: 'amount', type: 'number', required: true },
                { name: 'status', type: 'string' },
            ],
        },
        {
            name: 'borrower',
            fields: [{ name: 'email', type: 'string', required: true }],
        },
    ],
    actions: [
        { entity: 'loan', verb: 'Apply' },
        { entity: 'loan', verb: 'approve' },
    ],
};
describe('@dna-codes/input-example — parse (deterministic)', () => {
    it('PascalCases entity names into Nouns', () => {
        const { operational } = (0, index_1.parse)(sample, { domain: 'acme.finance.lending' });
        expect(operational.domain.nouns.map((n) => n.name)).toEqual(['Loan', 'Borrower']);
    });
    it('preserves attribute types and required flags', () => {
        const { operational } = (0, index_1.parse)(sample, { domain: 'acme.finance.lending' });
        const loan = operational.domain.nouns.find((n) => n.name === 'Loan');
        expect(loan?.attributes).toEqual([
            { name: 'amount', type: 'number', required: true },
            { name: 'status', type: 'string' },
        ]);
    });
    it('emits capabilities and attaches verbs to the matching Noun', () => {
        const { operational } = (0, index_1.parse)(sample, { domain: 'acme.finance.lending' });
        expect(operational.capabilities).toEqual([
            { noun: 'Loan', verb: 'Apply', name: 'Loan.Apply' },
            { noun: 'Loan', verb: 'Approve', name: 'Loan.Approve' },
        ]);
        const loan = operational.domain.nouns.find((n) => n.name === 'Loan');
        expect(loan?.verbs).toEqual([{ name: 'Apply' }, { name: 'Approve' }]);
    });
    it('uses the domain leaf as name and full path as path', () => {
        const { operational } = (0, index_1.parse)(sample, { domain: 'acme.finance.lending' });
        expect(operational.domain.name).toBe('lending');
        expect(operational.domain.path).toBe('acme.finance.lending');
    });
    it('throws when data is malformed', () => {
        expect(() => (0, index_1.parse)({}, { domain: 'x' })).toThrow(/entities/);
    });
    it('throws when options.domain is missing', () => {
        expect(() => (0, index_1.parse)(sample, {})).toThrow(/domain/);
    });
});
function mockFetch(body, status = 200) {
    const calls = [];
    const fetchImpl = (async (url, init) => {
        calls.push({ url: String(url), init: init ?? {} });
        return {
            ok: status >= 200 && status < 300,
            status,
            json: async () => body,
            text: async () => JSON.stringify(body),
        };
    });
    return { fetchImpl, calls };
}
const openAiBody = (content) => ({ choices: [{ message: { content } }] });
describe('@dna-codes/input-example — parseText (probabilistic)', () => {
    it('sends an OpenAI chat completion and parses the returned JSON', async () => {
        const dna = { operational: { domain: { name: 'x', path: 'x', nouns: [] } } };
        const { fetchImpl, calls } = mockFetch(openAiBody(JSON.stringify(dna)));
        const result = await (0, index_1.parseText)('A lending business.', {
            provider: 'openai',
            apiKey: 'sk-test',
            fetchImpl,
        });
        expect(calls).toHaveLength(1);
        expect(calls[0].url).toBe('https://api.openai.com/v1/chat/completions');
        const headers = calls[0].init.headers;
        expect(headers.authorization).toBe('Bearer sk-test');
        expect(result.operational?.domain.name).toBe('x');
        expect(result.raw).toBe(JSON.stringify(dna));
    });
    it('throws on empty text', async () => {
        await expect((0, index_1.parseText)('', { provider: 'openai', apiKey: 'sk-test', fetchImpl: mockFetch({}).fetchImpl })).rejects.toThrow(/non-empty string/);
    });
    it('throws on missing apiKey', async () => {
        await expect((0, index_1.parseText)('hi', { provider: 'openai', apiKey: '', fetchImpl: mockFetch({}).fetchImpl })).rejects.toThrow(/apiKey/);
    });
});
//# sourceMappingURL=index.test.js.map