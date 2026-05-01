"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Scratch: run @dna-codes/dna-input-text against a local Ollama server.
 *
 *   ollama pull llama3.1
 *   ollama serve   # if not already running
 *
 *   npx ts-node packages/input-text/examples/run-ollama.ts "We run a lending business..."
 *
 * Environment overrides:
 *   OLLAMA_BASE_URL  (default: http://localhost:11434/v1)
 *   OLLAMA_MODEL     (default: llama3.1)
 *
 * Note: smaller local models may struggle with strict JSON output. If you see
 * parse errors, try a larger/more-recent model (llama3.1:70b, qwen2.5:14b, etc.).
 */
const src_1 = require("../src");
async function readStdin() {
    const chunks = [];
    for await (const chunk of process.stdin)
        chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf8');
}
async function main() {
    const text = process.argv[2] ?? (await readStdin());
    if (!text.trim()) {
        console.error('Pass text as argv[2] or pipe it via stdin.');
        process.exit(1);
    }
    const result = await (0, src_1.parse)(text, {
        provider: 'openai',
        apiKey: 'ollama',
        baseUrl: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1',
        model: process.env.OLLAMA_MODEL ?? 'llama3.1',
        layers: ['operational'],
    });
    if (!result.operational) {
        console.error('No operational layer parsed. Raw model response:');
        console.error(result.raw);
        process.exit(1);
    }
    console.log(JSON.stringify({ operational: result.operational }, null, 2));
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=run-ollama.js.map