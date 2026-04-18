"use strict";
/**
 * LLM provider dispatch for the probabilistic mode.
 *
 * Kept as a small, fetch-only abstraction so the package has zero runtime
 * dependencies. Add or remove providers by extending the `Provider` union
 * in `types.ts` and updating the two maps + the `dispatch` switch below.
 *
 * Delete this file entirely if your fork is deterministic-only.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultModel = defaultModel;
exports.dispatch = dispatch;
const DEFAULT_MODEL = {
    openai: 'gpt-4o-mini',
    openrouter: 'anthropic/claude-sonnet-4-5',
    anthropic: 'claude-sonnet-4-5',
};
const DEFAULT_BASE_URL = {
    openai: 'https://api.openai.com/v1',
    openrouter: 'https://openrouter.ai/api/v1',
    anthropic: 'https://api.anthropic.com/v1',
};
function defaultModel(provider) {
    return DEFAULT_MODEL[provider];
}
async function dispatch(args) {
    const base = args.baseUrl ?? DEFAULT_BASE_URL[args.provider];
    if (args.provider === 'anthropic')
        return callAnthropic(base, args);
    return callOpenAICompatible(base, args);
}
async function callOpenAICompatible(base, args) {
    const res = await args.fetchImpl(`${base}/chat/completions`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${args.apiKey}`,
        },
        body: JSON.stringify({
            model: args.model,
            temperature: args.temperature,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: args.system },
                { role: 'user', content: args.user },
            ],
        }),
    });
    if (!res.ok)
        throw new Error(`${args.provider} ${res.status}: ${await res.text()}`);
    const body = (await res.json());
    const content = body.choices?.[0]?.message?.content;
    if (!content)
        throw new Error(`${args.provider}: empty response`);
    return content;
}
async function callAnthropic(base, args) {
    const res = await args.fetchImpl(`${base}/messages`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-api-key': args.apiKey,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: args.model,
            max_tokens: 4096,
            temperature: args.temperature,
            system: args.system,
            messages: [{ role: 'user', content: args.user }],
        }),
    });
    if (!res.ok)
        throw new Error(`anthropic ${res.status}: ${await res.text()}`);
    const body = (await res.json());
    const text = body.content?.find((b) => b.type === 'text')?.text;
    if (!text)
        throw new Error('anthropic: empty response');
    return text;
}
//# sourceMappingURL=providers.js.map