"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toOpenAITools = toOpenAITools;
exports.toAnthropicTools = toAnthropicTools;
function toOpenAITools(tools) {
    return tools.map((t) => ({
        type: 'function',
        function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters,
        },
    }));
}
function toAnthropicTools(tools) {
    return tools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters,
    }));
}
//# sourceMappingURL=provider-shapes.js.map