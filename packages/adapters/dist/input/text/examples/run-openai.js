"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Scratch: run @dna-codes/dna-input-text against OpenAI with your own key.
 *
 *   export OPENAI_API_KEY=sk-...
 *   npx ts-node packages/input-text/examples/run-openai.ts "We run a lending business..."
 *
 * Omit the arg to read from stdin:
 *   cat description.txt | npx ts-node packages/input-text/examples/run-openai.ts
 */
const src_1 = require("../src");
async function readStdin() {
    const chunks = [];
    for await (const chunk of process.stdin)
        chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf8');
}
async function main() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error('Set OPENAI_API_KEY in your environment.');
        process.exit(1);
    }
    const text = process.argv[2] ?? (await readStdin());
    if (!text.trim()) {
        console.error('Pass text as argv[2] or pipe it via stdin.');
        process.exit(1);
    }
    const result = await (0, src_1.parse)(text, {
        provider: 'openai',
        apiKey,
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        layers: ['operational'],
    });
    console.log(JSON.stringify({ operational: result.operational }, null, 2));
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=run-openai.js.map