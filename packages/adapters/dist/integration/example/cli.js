"use strict";
/**
 * CLI entrypoint — invoked by `bin/integration-example.js`.
 *
 * Three commands:
 *   pull  --out dna.json              fetch from the external system
 *   push  --in  dna.json              push a DNA doc to the external system
 *   serve --port 3000 --secret XYZ    listen for webhooks on a Node http server
 *
 * Parses argv manually to keep zero runtime dependencies. If your integration
 * grows a complex CLI surface, switch to a small zero-dep parser like
 * `minimist` or `mri` — but only at that point.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCli = runCli;
exports.parseArgs = parseArgs;
const fs_1 = require("fs");
const http_1 = require("http");
const client_1 = require("./client");
const webhook_1 = require("./webhook");
async function runCli(argv, env = process.env) {
    const [command, ...rest] = argv;
    if (!command || command === 'help' || command === '--help') {
        printUsage();
        return 0;
    }
    const args = parseArgs(rest);
    try {
        if (command === 'pull')
            return await pullCommand(args, env);
        if (command === 'push')
            return await pushCommand(args, env);
        if (command === 'serve')
            return await serveCommand(args, env);
        console.error(`Unknown command: ${command}\n`);
        printUsage();
        return 64;
    }
    catch (err) {
        console.error(err instanceof Error ? err.message : String(err));
        return 1;
    }
}
async function pullCommand(args, env) {
    const out = args.flags.out;
    if (typeof out !== 'string') {
        console.error('pull: --out <path> is required');
        return 64;
    }
    const client = clientFromEnv(env);
    const dna = await client.pullDna();
    (0, fs_1.writeFileSync)(out, JSON.stringify(dna, null, 2));
    console.log(`wrote ${out}`);
    return 0;
}
async function pushCommand(args, env) {
    const input = args.flags.in;
    if (typeof input !== 'string') {
        console.error('push: --in <path> is required');
        return 64;
    }
    const client = clientFromEnv(env);
    const dna = JSON.parse((0, fs_1.readFileSync)(input, 'utf-8'));
    const { created } = await client.pushDna(dna);
    console.log(`created ${created} item(s)`);
    return 0;
}
async function serveCommand(args, env) {
    const port = Number(args.flags.port ?? env.PORT ?? 3000);
    const secret = String(args.flags.secret ?? env.EXAMPLE_WEBHOOK_SECRET ?? '');
    if (!secret) {
        console.error('serve: provide --secret <value> or set EXAMPLE_WEBHOOK_SECRET');
        return 64;
    }
    const handler = (0, webhook_1.createNodeHandler)({ secret }, (event) => {
        console.log(`[${event.occurredAt}] ${event.type} — ${event.item.id} ${event.item.title}`);
    });
    const server = (0, http_1.createServer)((req, res) => {
        handler(req, res).catch((err) => {
            console.error(err);
            res.statusCode = 500;
            res.end('internal error');
        });
    });
    await new Promise((resolve) => server.listen(port, resolve));
    console.log(`listening on :${port}`);
    return new Promise(() => { });
}
function clientFromEnv(env) {
    const baseUrl = env.EXAMPLE_BASE_URL;
    const apiToken = env.EXAMPLE_API_TOKEN;
    if (!baseUrl || !apiToken) {
        throw new Error('Set EXAMPLE_BASE_URL and EXAMPLE_API_TOKEN in your environment.');
    }
    return (0, client_1.createClient)({ baseUrl, apiToken });
}
function parseArgs(argv) {
    const flags = {};
    const positional = [];
    for (let i = 0; i < argv.length; i++) {
        const tok = argv[i];
        if (tok.startsWith('--')) {
            const key = tok.slice(2);
            const next = argv[i + 1];
            if (next && !next.startsWith('--')) {
                flags[key] = next;
                i++;
            }
            else {
                flags[key] = true;
            }
        }
        else {
            positional.push(tok);
        }
    }
    return { positional, flags };
}
function printUsage() {
    console.log(`integration-example — template CLI

Usage:
  integration-example pull  --out <dna.json>
  integration-example push  --in  <dna.json>
  integration-example serve --port <port> --secret <hmac-secret>

Environment:
  EXAMPLE_BASE_URL         Base URL of the external API (required for pull/push)
  EXAMPLE_API_TOKEN        Bearer token for the external API (required for pull/push)
  EXAMPLE_WEBHOOK_SECRET   HMAC-SHA256 shared secret (fallback for --secret)
`);
}
//# sourceMappingURL=cli.js.map