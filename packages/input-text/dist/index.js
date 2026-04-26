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
exports.toAnthropicTools = exports.toOpenAITools = exports.PRIMITIVE_KINDS = exports.FINALIZE_TOOL = exports.injectEnums = exports.buildPrimitiveTool = exports.buildLayeredTools = exports.LayeredConstructor = void 0;
exports.parse = parse;
const constructor_1 = require("./layered/constructor");
const prompt_1 = require("./layered/prompt");
const prompt_2 = require("./prompt");
const providers_1 = require("./providers");
const provider_shapes_1 = require("./tools/provider-shapes");
const DEFAULT_LAYERS = ['operational', 'product', 'technical'];
async function parse(text, options) {
    if (typeof text !== 'string' || text.trim().length === 0) {
        throw new Error('input-text.parse: text must be a non-empty string.');
    }
    if (!options.apiKey) {
        throw new Error('input-text.parse: options.apiKey is required.');
    }
    if (options.mode === 'layered')
        return parseLayered(text, options);
    return parseOneShot(text, options);
}
async function parseOneShot(text, options) {
    const layers = options.layers ?? DEFAULT_LAYERS;
    const raw = await (0, providers_1.dispatch)({
        provider: options.provider,
        apiKey: options.apiKey,
        baseUrl: options.baseUrl,
        model: options.model ?? (0, providers_1.defaultModel)(options.provider),
        system: (0, prompt_2.buildSystemPrompt)(layers, options.instructions),
        user: (0, prompt_2.buildUserPrompt)(text, layers),
        temperature: options.temperature ?? 0,
        fetchImpl: options.fetchImpl ?? fetch,
    });
    const parsed = parseJson(raw);
    const missingLayers = layers.filter((l) => !parsed[l]);
    if (missingLayers.length) {
        handleMissing(missingLayers, layers, options.onMissingLayers ?? 'warn');
    }
    return {
        ...(parsed.operational ? { operational: parsed.operational } : {}),
        ...(parsed.product ? { product: parsed.product } : {}),
        ...(parsed.technical ? { technical: parsed.technical } : {}),
        missingLayers,
        raw,
    };
}
async function parseLayered(text, options) {
    const layers = (options.layers ?? ['operational']).filter((l) => l === 'operational');
    if (layers.length === 0) {
        throw new Error('input-text.parse: layered mode currently supports the operational layer only.');
    }
    const ctor = new constructor_1.LayeredConstructor({ maxToolCalls: options.maxToolCalls });
    const tools = ctor.tools();
    const providerTools = options.provider === 'anthropic' ? (0, provider_shapes_1.toAnthropicTools)(tools) : (0, provider_shapes_1.toOpenAITools)(tools);
    const fetchImpl = options.fetchImpl ?? fetch;
    const system = (0, prompt_1.buildLayeredSystemPrompt)(options.instructions);
    const user = (0, prompt_1.buildLayeredUserPrompt)(text);
    let messages = [{ role: 'user', content: user }];
    const transcript = [];
    const maxToolCalls = options.maxToolCalls ?? 50;
    let calls = 0;
    while (calls < maxToolCalls + 5) {
        const dispatchResult = await (0, providers_1.dispatchToolCall)({
            provider: options.provider,
            apiKey: options.apiKey,
            baseUrl: options.baseUrl,
            model: options.model ?? (0, providers_1.defaultModel)(options.provider),
            system,
            messages,
            tools: providerTools,
            temperature: options.temperature ?? 0,
            fetchImpl,
        });
        if (dispatchResult.type === 'final') {
            // Model emitted a final message without calling finalize — treat as terminal.
            messages = [...messages, { role: 'assistant', content: dispatchResult.content }];
            break;
        }
        calls += 1;
        const toolResult = ctor.handle({ name: dispatchResult.name, args: dispatchResult.args });
        transcript.push({ name: dispatchResult.name, args: dispatchResult.args, result: toolResult });
        messages = [
            ...messages,
            {
                role: 'assistant',
                toolCalls: [{ id: dispatchResult.id, name: dispatchResult.name, arguments: JSON.stringify(dispatchResult.args) }],
            },
        ];
        messages = (0, providers_1.appendToolResult)(messages, dispatchResult.id, dispatchResult.name, toolResult);
        if (toolResult.ok && 'finalized' in toolResult && toolResult.finalized)
            break;
    }
    const operational = ctor.hasFinalized() ? ctor.result() : undefined;
    const missingLayers = operational ? [] : ['operational'];
    if (missingLayers.length) {
        handleMissing(missingLayers, layers, options.onMissingLayers ?? 'warn');
    }
    return {
        ...(operational ? { operational } : {}),
        missingLayers,
        raw: JSON.stringify(transcript, null, 2),
    };
}
function handleMissing(missingLayers, requested, mode) {
    const message = `input-text.parse: model returned ${requested.length - missingLayers.length}/${requested.length} requested layers. Missing: ${missingLayers.join(', ')}.`;
    if (mode === 'throw')
        throw new Error(message);
    if (mode === 'warn')
        console.warn(message);
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
var constructor_2 = require("./layered/constructor");
Object.defineProperty(exports, "LayeredConstructor", { enumerable: true, get: function () { return constructor_2.LayeredConstructor; } });
var schema_to_tool_1 = require("./tools/schema-to-tool");
Object.defineProperty(exports, "buildLayeredTools", { enumerable: true, get: function () { return schema_to_tool_1.buildLayeredTools; } });
Object.defineProperty(exports, "buildPrimitiveTool", { enumerable: true, get: function () { return schema_to_tool_1.buildPrimitiveTool; } });
Object.defineProperty(exports, "injectEnums", { enumerable: true, get: function () { return schema_to_tool_1.injectEnums; } });
Object.defineProperty(exports, "FINALIZE_TOOL", { enumerable: true, get: function () { return schema_to_tool_1.FINALIZE_TOOL; } });
Object.defineProperty(exports, "PRIMITIVE_KINDS", { enumerable: true, get: function () { return schema_to_tool_1.PRIMITIVE_KINDS; } });
var provider_shapes_2 = require("./tools/provider-shapes");
Object.defineProperty(exports, "toOpenAITools", { enumerable: true, get: function () { return provider_shapes_2.toOpenAITools; } });
Object.defineProperty(exports, "toAnthropicTools", { enumerable: true, get: function () { return provider_shapes_2.toAnthropicTools; } });
//# sourceMappingURL=index.js.map