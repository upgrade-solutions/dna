"use strict";
/**
 * Example runner for the probabilistic mode with Anthropic.
 *
 *   export ANTHROPIC_API_KEY=sk-ant-...
 *   npx ts-node packages/input-example/examples/run-anthropic.ts "We run a lending business..."
 */
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
async function readStdin() {
    if (process.stdin.isTTY)
        return '';
    const chunks = [];
    for await (const chunk of process.stdin)
        chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf-8');
}
async function main() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        console.error('Set ANTHROPIC_API_KEY in your environment.');
        process.exit(1);
    }
    const text = process.argv[2] ?? (await readStdin());
    if (!text.trim()) {
        console.error('Pass text as argv[2] or pipe it via stdin.');
        process.exit(1);
    }
    const result = await (0, src_1.parseText)(text, {
        provider: 'anthropic',
        apiKey,
        model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5',
    });
    console.log(JSON.stringify({ operational: result.operational }, null, 2));
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=run-anthropic.js.map