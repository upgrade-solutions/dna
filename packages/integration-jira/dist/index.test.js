"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const adf_1 = require("./adf");
const client_1 = require("./client");
const mapping_1 = require("./mapping");
const cli_1 = require("./cli");
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
const dnaFixture = {
    operational: {
        domain: { name: 'lending', path: 'acme.lending' },
        capabilities: [
            { name: 'Loan.Apply', resource: 'Loan', action: 'Apply', description: 'Submit a loan.' },
            { name: 'Loan.Approve', resource: 'Loan', action: 'Approve' },
        ],
        rules: [
            { capability: 'Loan.Apply', type: 'access', allow: [{ role: 'borrower' }] },
        ],
        outcomes: [
            { capability: 'Loan.Apply', changes: [{ attribute: 'loan.status', set: 'pending' }] },
        ],
    },
};
describe('adf', () => {
    it('extracts plain text from an ADF doc', () => {
        const adf = {
            type: 'doc',
            content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'Hello world.' }] },
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'Second ' },
                        { type: 'text', text: 'paragraph.' },
                    ],
                },
            ],
        };
        expect((0, adf_1.extractText)(adf)).toBe('Hello world.\n\nSecond paragraph.');
    });
    it('returns a string description unchanged', () => {
        expect((0, adf_1.extractText)('plain text')).toBe('plain text');
    });
    it('treats null/undefined as empty', () => {
        expect((0, adf_1.extractText)(null)).toBe('');
        expect((0, adf_1.extractText)(undefined)).toBe('');
    });
    it('fromMarkdown produces ADF paragraphs for blank-line-separated blocks', () => {
        const adf = (0, adf_1.fromMarkdown)('alpha\n\nbeta');
        expect(adf.type).toBe('doc');
        expect(adf.content).toHaveLength(2);
        expect(adf.content?.[0]).toEqual({
            type: 'paragraph',
            content: [{ type: 'text', text: 'alpha' }],
        });
    });
});
describe('mapping — dnaToStoryFields', () => {
    it('creates one Story-shaped field set per capability', () => {
        const stories = (0, mapping_1.dnaToStoryFields)(dnaFixture, {
            projectKey: 'ENG',
            epicKey: 'ENG-100',
            issueType: 'Story',
        });
        expect(stories).toHaveLength(2);
        expect(stories[0]).toMatchObject({
            summary: 'Apply Loan',
            project: { key: 'ENG' },
            issuetype: { name: 'Story' },
            customfield_10014: 'ENG-100',
        });
        expect(stories[0].labels).toContain('dna:capability-loan-apply');
        expect(typeof stories[0].description).toBe('string');
        expect(stories[0].description).toContain('**As a** borrower');
    });
    it('merges extra labels', () => {
        const [story] = (0, mapping_1.dnaToStoryFields)(dnaFixture, {
            projectKey: 'ENG',
            epicKey: 'ENG-100',
            issueType: 'Story',
            labels: ['generated', 'needs-review'],
        });
        expect(story.labels).toEqual(['dna:capability-loan-apply', 'generated', 'needs-review']);
    });
});
describe('client', () => {
    const baseOpts = {
        baseUrl: 'https://acme.atlassian.net',
        email: 'tim@example.com',
        apiToken: 'tok',
        projectKey: 'ENG',
    };
    it('sends Basic auth computed from email:apiToken', async () => {
        const { fetchImpl, calls } = mockFetch(() => ({
            body: { id: '1', key: 'ENG-100', fields: { summary: 'Epic', description: null } },
        }));
        const client = (0, client_1.createClient)({ ...baseOpts, fetchImpl });
        await client.getEpic('ENG-100');
        const auth = calls[0].init.headers.authorization;
        const expected = 'Basic ' + Buffer.from('tim@example.com:tok').toString('base64');
        expect(auth).toBe(expected);
        expect(calls[0].url).toBe('https://acme.atlassian.net/rest/api/3/issue/ENG-100');
    });
    it('extractEpicText combines summary + ADF description', async () => {
        const { fetchImpl } = mockFetch(() => ({
            body: {
                id: '1',
                key: 'ENG-100',
                fields: {
                    summary: 'Build lending flow',
                    description: {
                        type: 'doc',
                        content: [
                            { type: 'paragraph', content: [{ type: 'text', text: 'Borrowers apply.' }] },
                        ],
                    },
                },
            },
        }));
        const client = (0, client_1.createClient)({ ...baseOpts, fetchImpl });
        const epic = await client.getEpic('ENG-100');
        expect(client.extractEpicText(epic)).toBe('Build lending flow\n\nBorrowers apply.');
    });
    it('pushStoriesToEpic dry-run returns planned stories without calling fetch', async () => {
        const { fetchImpl, calls } = mockFetch(() => ({ body: {} }));
        const client = (0, client_1.createClient)({ ...baseOpts, fetchImpl });
        const result = await client.pushStoriesToEpic('ENG-100', dnaFixture, { dryRun: true });
        expect(calls).toHaveLength(0);
        expect(result.planned).toHaveLength(2);
        expect(result.planned?.[0].summary).toBe('Apply Loan');
    });
    it('pushStoriesToEpic creates one issue per capability with ADF description', async () => {
        const bodies = [];
        const { fetchImpl } = mockFetch((_url, init) => {
            const body = JSON.parse(init.body);
            bodies.push(body);
            return { body: { id: String(bodies.length), key: `ENG-${100 + bodies.length}`, self: '' } };
        });
        const client = (0, client_1.createClient)({ ...baseOpts, fetchImpl });
        const result = await client.pushStoriesToEpic('ENG-100', dnaFixture);
        expect(result.created).toHaveLength(2);
        expect(result.created[0].key).toBe('ENG-101');
        const first = bodies[0];
        expect(first.fields.description.type).toBe('doc');
    });
    it('throws on a non-2xx Jira response', async () => {
        const { fetchImpl } = mockFetch(() => ({ status: 404, body: 'not found' }));
        const client = (0, client_1.createClient)({ ...baseOpts, fetchImpl });
        await expect(client.getEpic('ENG-999')).rejects.toThrow(/404/);
    });
    it('validates required options', () => {
        expect(() => (0, client_1.createClient)({ ...baseOpts, baseUrl: '' })).toThrow(/baseUrl/);
        expect(() => (0, client_1.createClient)({ ...baseOpts, email: '' })).toThrow(/email/);
        expect(() => (0, client_1.createClient)({ ...baseOpts, apiToken: '' })).toThrow(/apiToken/);
        expect(() => (0, client_1.createClient)({ ...baseOpts, projectKey: '' })).toThrow(/projectKey/);
    });
});
describe('cli parseArgs', () => {
    it('parses --flag value and boolean flags', () => {
        const parsed = (0, cli_1.parseArgs)(['--epic', 'ENG-1', '--in', 'dna.json', '--dry-run']);
        expect(parsed.flags.epic).toBe('ENG-1');
        expect(parsed.flags.in).toBe('dna.json');
        expect(parsed.flags['dry-run']).toBe(true);
    });
});
//# sourceMappingURL=index.test.js.map