"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
function scriptedFetch(script) {
    let i = 0;
    const state = { calls: 0 };
    const fetchImpl = (async (_url, _init) => {
        state.calls += 1;
        const next = i < script.length ? script[i++] : null;
        let body;
        if (!next) {
            body = {
                choices: [
                    { message: { role: 'assistant', content: 'done', tool_calls: undefined } },
                ],
            };
        }
        else {
            body = {
                choices: [
                    {
                        message: {
                            role: 'assistant',
                            content: null,
                            tool_calls: [
                                {
                                    id: `call_${i}`,
                                    type: 'function',
                                    function: { name: next.name, arguments: JSON.stringify(next.args) },
                                },
                            ],
                        },
                    },
                ],
            };
        }
        return {
            ok: true,
            status: 200,
            json: async () => body,
            text: async () => JSON.stringify(body),
        };
    });
    return { fetchImpl, get calls() { return state.calls; } };
}
describe('parse() — layered mode', () => {
    it('round-trips a known-good operational document via stubbed tool calls', async () => {
        const script = [
            { name: 'add_resource', args: { name: 'Loan' } },
            { name: 'add_person', args: { name: 'Borrower' } },
            { name: 'add_person', args: { name: 'Employee' } },
            { name: 'add_group', args: { name: 'BankDepartment' } },
            { name: 'add_role', args: { name: 'Underwriter', scope: 'BankDepartment' } },
            {
                name: 'add_membership',
                args: { name: 'EmployeeUnderwriter', person: 'Employee', role: 'Underwriter' },
            },
            {
                name: 'add_operation',
                args: { target: 'Loan', action: 'Apply', name: 'Loan.Apply' },
            },
            { name: 'finalize', args: {} },
        ];
        const { fetchImpl } = scriptedFetch(script);
        const result = await (0, index_1.parse)('A lending business.', {
            provider: 'openai',
            apiKey: 'sk-test',
            mode: 'layered',
            fetchImpl,
        });
        expect(result.operational).toBeDefined();
        expect(result.missingLayers).toEqual([]);
        const op = result.operational;
        expect(op.domain.resources).toHaveLength(1);
    });
    it('feeds back unknown_role and accepts the corrected sequence', async () => {
        const script = [
            { name: 'add_person', args: { name: 'Employee' } },
            // Bad call: role hasn't been declared yet
            {
                name: 'add_membership',
                args: { name: 'EmployeeUnderwriter', person: 'Employee', role: 'Underwriter' },
            },
            // Recovery
            { name: 'add_group', args: { name: 'BankDepartment' } },
            { name: 'add_role', args: { name: 'Underwriter', scope: 'BankDepartment' } },
            {
                name: 'add_membership',
                args: { name: 'EmployeeUnderwriter', person: 'Employee', role: 'Underwriter' },
            },
            { name: 'finalize', args: {} },
        ];
        const { fetchImpl } = scriptedFetch(script);
        const result = await (0, index_1.parse)('Domain text.', {
            provider: 'openai',
            apiKey: 'sk-test',
            mode: 'layered',
            fetchImpl,
        });
        expect(result.operational).toBeDefined();
        const transcript = JSON.parse(result.raw);
        const failure = transcript.find((t) => t.result.ok === false);
        expect(failure).toBeDefined();
        expect(failure.result.error).toBe('unknown_role');
    });
    it('reports missingLayers when the loop ends without finalizing', async () => {
        const script = [
            { name: 'add_resource', args: { name: 'Loan' } },
            // No finalize; provider then returns a final text and the loop exits.
        ];
        const { fetchImpl } = scriptedFetch(script);
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => { });
        const result = await (0, index_1.parse)('text', {
            provider: 'openai',
            apiKey: 'sk-test',
            mode: 'layered',
            fetchImpl,
        });
        expect(result.operational).toBeUndefined();
        expect(result.missingLayers).toEqual(['operational']);
        expect(warn).toHaveBeenCalledWith(expect.stringMatching(/Missing: operational/));
        warn.mockRestore();
    });
    it('honors maxToolCalls and stops the loop', async () => {
        const script = [
            { name: 'add_person', args: { name: 'A' } },
            { name: 'add_person', args: { name: 'B' } },
            { name: 'add_person', args: { name: 'C' } },
            { name: 'add_person', args: { name: 'D' } },
        ];
        const { fetchImpl } = scriptedFetch(script);
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => { });
        await expect((0, index_1.parse)('x', {
            provider: 'openai',
            apiKey: 'sk-test',
            mode: 'layered',
            maxToolCalls: 2,
            fetchImpl,
        })).rejects.toThrow(/Iteration cap of 2/);
        warn.mockRestore();
    });
    it('default mode (omitted) still calls the one-shot path', async () => {
        const calls = [];
        const fetchImpl = (async (url, init) => {
            calls.push({ url: String(url), body: String(init?.body ?? '') });
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    choices: [
                        {
                            message: {
                                content: JSON.stringify({
                                    operational: { domain: { name: 'x' } },
                                }),
                            },
                        },
                    ],
                }),
                text: async () => '',
            };
        });
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => { });
        await (0, index_1.parse)('text', { provider: 'openai', apiKey: 'sk-test', fetchImpl });
        warn.mockRestore();
        expect(calls).toHaveLength(1);
        const body = JSON.parse(calls[0].body);
        expect(body.tools).toBeUndefined();
        expect(body.response_format).toEqual({ type: 'json_object' });
    });
});
//# sourceMappingURL=parse.test.js.map