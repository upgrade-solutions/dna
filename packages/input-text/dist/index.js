"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
const prompt_1 = require("./prompt");
const providers_1 = require("./providers");
const DEFAULT_LAYERS = ['operational', 'product', 'technical'];
async function parse(text, options) {
    if (typeof text !== 'string' || text.trim().length === 0) {
        throw new Error('input-text.parse: text must be a non-empty string.');
    }
    if (!options.apiKey) {
        throw new Error('input-text.parse: options.apiKey is required.');
    }
    const layers = options.layers ?? DEFAULT_LAYERS;
    const raw = await (0, providers_1.dispatch)({
        provider: options.provider,
        apiKey: options.apiKey,
        baseUrl: options.baseUrl,
        model: options.model ?? (0, providers_1.defaultModel)(options.provider),
        system: (0, prompt_1.buildSystemPrompt)(layers, options.instructions),
        user: (0, prompt_1.buildUserPrompt)(text, layers),
        temperature: options.temperature ?? 0,
        fetchImpl: options.fetchImpl ?? fetch,
    });
    const parsed = parseJson(raw);
    const missingLayers = layers.filter((l) => !parsed[l]);
    if (missingLayers.length) {
        const mode = options.onMissingLayers ?? 'warn';
        const message = `input-text.parse: model returned ${layers.length - missingLayers.length}/${layers.length} requested layers. Missing: ${missingLayers.join(', ')}.`;
        if (mode === 'throw')
            throw new Error(message);
        if (mode === 'warn')
            console.warn(message);
    }
    return {
        ...(parsed.operational ? { operational: parsed.operational } : {}),
        ...(parsed.product ? { product: parsed.product } : {}),
        ...(parsed.technical ? { technical: parsed.technical } : {}),
        missingLayers,
        raw,
    };
}
function parseJson(raw) {
    const stripped = stripFences(raw.trim());
    try {
        const value = JSON.parse(stripped);
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            throw new Error('expected top-level object');
        }
        return value;
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`input-text.parse: model did not return valid JSON (${message}). Raw:\n${raw}`);
    }
}
function stripFences(s) {
    const match = s.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    return match ? match[1] : s;
}
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map