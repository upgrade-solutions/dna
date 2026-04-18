"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
function mockFetch(responseBody, status = 200) {
    const calls = [];
    const fetchImpl = (async (url, init) => {
        calls.push({ url: String(url), init: init ?? {} });
        return {
            ok: status >= 200 && status < 300,
            status,
            json: async () => responseBody,
            text: async () => JSON.stringify(responseBody),
        };
    });
    return { fetchImpl, calls };
}
const openAiResponse = (content) => ({
    choices: [{ message: { content } }],
});
const anthropicResponse = (text) => ({
    content: [{ type: 'text', text }],
});
const sampleDna = {
    operational: {
        domain: { name: 'acme', path: 'acme', nouns: [{ name: 'Loan', attributes: [], verbs: [] }] },
    },
};
describe('@dna-codes/input-text', () => {
    describe('dispatch', () => {
        it('sends an OpenAI chat completion request with Bearer auth', async () => {
            const { fetchImpl, calls } = mockFetch(openAiResponse(JSON.stringify(sampleDna)));
            await (0, index_1.parse)('A lending business.', {
                provider: 'openai',
                apiKey: 'sk-test',
                fetchImpl,
            });
            expect(calls).toHaveLength(1);
            expect(calls[0].url).toBe('https://api.openai.com/v1/chat/completions');
            const headers = calls[0].init.headers;
            expect(headers.authorization).toBe('Bearer sk-test');
            const body = JSON.parse(calls[0].init.body);
            expect(body.model).toBe('gpt-4o-mini');
            expect(body.response_format).toEqual({ type: 'json_object' });
            expect(body.messages[0].role).toBe('system');
            expect(body.messages[1].role).toBe('user');
        });
        it('sends an OpenRouter request to the OpenRouter base', async () => {
            const { fetchImpl, calls } = mockFetch(openAiResponse(JSON.stringify(sampleDna)));
            await (0, index_1.parse)('A lending business.', {
                provider: 'openrouter',
                apiKey: 'or-test',
                fetchImpl,
            });
            expect(calls[0].url).toBe('https://openrouter.ai/api/v1/chat/completions');
            expect(calls[0].init.headers.authorization).toBe('Bearer or-test');
        });
        it('sends an Anthropic messages request with x-api-key', async () => {
            const { fetchImpl, calls } = mockFetch(anthropicResponse(JSON.stringify(sampleDna)));
            await (0, index_1.parse)('A lending business.', {
                provider: 'anthropic',
                apiKey: 'ak-test',
                fetchImpl,
            });
            expect(calls[0].url).toBe('https://api.anthropic.com/v1/messages');
            const headers = calls[0].init.headers;
            expect(headers['x-api-key']).toBe('ak-test');
            expect(headers['anthropic-version']).toBe('2023-06-01');
            const body = JSON.parse(calls[0].init.body);
            expect(body.system).toContain('DNA');
            expect(body.messages).toHaveLength(1);
        });
        it('honors a custom baseUrl', async () => {
            const { fetchImpl, calls } = mockFetch(openAiResponse(JSON.stringify(sampleDna)));
            await (0, index_1.parse)('A lending business.', {
                provider: 'openai',
                apiKey: 'sk-test',
                baseUrl: 'https://proxy.example.com/v1',
                fetchImpl,
            });
            expect(calls[0].url).toBe('https://proxy.example.com/v1/chat/completions');
        });
        it('honors a custom model', async () => {
            const { fetchImpl, calls } = mockFetch(openAiResponse(JSON.stringify(sampleDna)));
            await (0, index_1.parse)('A lending business.', {
                provider: 'openai',
                apiKey: 'sk-test',
                model: 'gpt-4o',
                fetchImpl,
            });
            const body = JSON.parse(calls[0].init.body);
            expect(body.model).toBe('gpt-4o');
        });
    });
    describe('response parsing', () => {
        it('returns parsed operational DNA from a plain JSON response', async () => {
            const { fetchImpl } = mockFetch(openAiResponse(JSON.stringify(sampleDna)));
            const result = await (0, index_1.parse)('A lending business.', {
                provider: 'openai',
                apiKey: 'sk-test',
                fetchImpl,
            });
            expect(result.operational).toEqual(sampleDna.operational);
            expect(result.raw).toBe(JSON.stringify(sampleDna));
        });
        it('strips markdown fences if the model emits them', async () => {
            const fenced = '```json\n' + JSON.stringify(sampleDna) + '\n```';
            const { fetchImpl } = mockFetch(openAiResponse(fenced));
            const result = await (0, index_1.parse)('A lending business.', {
                provider: 'openai',
                apiKey: 'sk-test',
                fetchImpl,
            });
            expect(result.operational).toEqual(sampleDna.operational);
        });
        it('splays out product and technical layers when present', async () => {
            const full = {
                operational: sampleDna.operational,
                product: { core: { resources: [] } },
                technical: { cells: [] },
            };
            const { fetchImpl } = mockFetch(openAiResponse(JSON.stringify(full)));
            const result = await (0, index_1.parse)('Full system.', {
                provider: 'openai',
                apiKey: 'sk-test',
                fetchImpl,
            });
            expect(result.operational).toBeDefined();
            expect(result.product).toEqual(full.product);
            expect(result.technical).toEqual(full.technical);
        });
        it('throws on invalid JSON with the raw text included', async () => {
            const { fetchImpl } = mockFetch(openAiResponse('not json at all'));
            await expect((0, index_1.parse)('x', { provider: 'openai', apiKey: 'sk-test', fetchImpl })).rejects.toThrow(/not json at all/);
        });
        it('throws when the model returns a non-object top level', async () => {
            const { fetchImpl } = mockFetch(openAiResponse('[1, 2, 3]'));
            await expect((0, index_1.parse)('x', { provider: 'openai', apiKey: 'sk-test', fetchImpl })).rejects.toThrow(/top-level object/);
        });
    });
    describe('layers', () => {
        it('mentions only requested layers in the user prompt', async () => {
            const { fetchImpl, calls } = mockFetch(openAiResponse(JSON.stringify(sampleDna)));
            await (0, index_1.parse)('A lending business.', {
                provider: 'openai',
                apiKey: 'sk-test',
                layers: ['operational'],
                fetchImpl,
            });
            const body = JSON.parse(calls[0].init.body);
            expect(body.messages[1].content).toContain('Requested layers: operational');
            expect(body.messages[1].content).not.toContain('product');
        });
    });
    describe('validation', () => {
        it('rejects empty text', async () => {
            await expect((0, index_1.parse)('', { provider: 'openai', apiKey: 'sk-test', fetchImpl: (() => { }) })).rejects.toThrow(/non-empty string/);
        });
        it('rejects missing api key', async () => {
            await expect((0, index_1.parse)('x', { provider: 'openai', apiKey: '', fetchImpl: (() => { }) })).rejects.toThrow(/apiKey is required/);
        });
        it('surfaces non-2xx responses with status and body', async () => {
            const { fetchImpl } = mockFetch({ error: 'bad key' }, 401);
            await expect((0, index_1.parse)('x', { provider: 'openai', apiKey: 'sk-test', fetchImpl })).rejects.toThrow(/openai 401/);
        });
    });
});
//# sourceMappingURL=index.test.js.map