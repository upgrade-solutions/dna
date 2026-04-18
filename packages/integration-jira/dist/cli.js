"use strict";
/**
 * CLI for @dna-codes/integration-jira.
 *
 * Three commands:
 *   pull  --epic ENG-123 --out dna.json       Epic → input-text → DNA JSON
 *   push  --epic ENG-123 --in  dna.json       DNA → output-text → Jira Stories
 *   sync  --epic ENG-123                      pull then push in a single run
 *
 * Credentials come from env vars — never flags — so they don't land in shell
 * history. LLM provider is likewise env-driven.
 *
 * `serve` is intentionally absent: Jira Cloud's native webhooks don't ship
 * signed bodies that an external verifier can validate safely. Consumers
 * who need inbound events should use Jira Automation with an outbound
 * webhook that signs the payload, or Forge.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCli = runCli;
exports.parseArgs = parseArgs;
const fs_1 = require("fs");
const client_1 = require("./client");
const VALID_STYLES = ['user-story', 'gherkin', 'product-dna'];
function parseStyle(flag) {
    if (typeof flag !== 'string')
        return undefined;
    if (VALID_STYLES.includes(flag))
        return flag;
    throw new Error(`--style must be one of: ${VALID_STYLES.join(', ')}`);
}
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
        if (command === 'update')
            return await updateCommand(args, env);
        if (command === 'sync')
            return await syncCommand(args, env);
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
    const epic = requireFlag(args, 'epic');
    const out = requireFlag(args, 'out');
    if (!epic || !out)
        return 64;
    const dumpTextPath = typeof args.flags['dump-text'] === 'string'
        ? args.flags['dump-text']
        : args.flags['dump-text'] === true
            ? out.replace(/\.json$/, '') + '.epic.txt'
            : null;
    const client = (0, client_1.createClient)(clientOptionsFromEnv(env));
    if (dumpTextPath) {
        const issue = await client.getEpic(epic);
        const text = client.extractEpicText(issue);
        (0, fs_1.writeFileSync)(dumpTextPath, text);
        console.log(`wrote ${dumpTextPath} (${text.length} chars)`);
    }
    const dna = await client.pullDnaFromEpic(epic, pullOptionsFromEnv(env));
    (0, fs_1.writeFileSync)(out, JSON.stringify(dna, null, 2));
    console.log(`wrote ${out}`);
    return 0;
}
async function pushCommand(args, env) {
    const epic = requireFlag(args, 'epic');
    const input = requireFlag(args, 'in');
    if (!epic || !input)
        return 64;
    const dryRun = Boolean(args.flags['dry-run']);
    const labelsFlag = args.flags.labels;
    const labels = typeof labelsFlag === 'string'
        ? labelsFlag.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined;
    const style = parseStyle(args.flags.style);
    const client = (0, client_1.createClient)(clientOptionsFromEnv(env));
    const dna = JSON.parse((0, fs_1.readFileSync)(input, 'utf-8'));
    const result = await client.pushStoriesToEpic(epic, dna, {
        dryRun,
        ...(labels ? { labels } : {}),
        ...(style ? { style } : {}),
    });
    if (dryRun) {
        console.log(`[dry-run] would create ${result.planned?.length ?? 0} stor(ies) under ${epic}`);
        for (const p of result.planned ?? [])
            console.log(`- ${p.summary}`);
    }
    else {
        console.log(`created ${result.created.length} stor(ies) under ${epic}`);
        for (const c of result.created)
            console.log(`- ${c.key} — ${c.summary}`);
    }
    return 0;
}
async function updateCommand(args, env) {
    const epic = requireFlag(args, 'epic');
    const input = requireFlag(args, 'in');
    if (!epic || !input)
        return 64;
    const style = parseStyle(args.flags.style);
    const client = (0, client_1.createClient)(clientOptionsFromEnv(env));
    const dna = JSON.parse((0, fs_1.readFileSync)(input, 'utf-8'));
    const result = await client.updateStoriesUnderEpic(epic, dna, style);
    console.log(`updated ${result.updated.length} stor(ies) under ${epic}`);
    for (const u of result.updated)
        console.log(`- ${u.key} — ${u.summary}`);
    if (result.skipped.length) {
        console.log(`\nskipped ${result.skipped.length}:`);
        for (const s of result.skipped)
            console.log(`- ${s.id} (${s.reason})`);
    }
    return 0;
}
async function syncCommand(args, env) {
    const epic = requireFlag(args, 'epic');
    if (!epic)
        return 64;
    const client = (0, client_1.createClient)(clientOptionsFromEnv(env));
    const dna = await client.pullDnaFromEpic(epic, pullOptionsFromEnv(env));
    const result = await client.pushStoriesToEpic(epic, dna);
    console.log(`synced ${result.created.length} stor(ies) from ${epic}`);
    for (const c of result.created)
        console.log(`- ${c.key} — ${c.summary}`);
    return 0;
}
function clientOptionsFromEnv(env) {
    const baseUrl = env.JIRA_BASE_URL;
    const email = env.JIRA_EMAIL;
    const apiToken = env.JIRA_API_TOKEN;
    const projectKey = env.JIRA_PROJECT_KEY;
    if (!baseUrl || !email || !apiToken || !projectKey) {
        throw new Error('Set JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, and JIRA_PROJECT_KEY in your environment.');
    }
    const storyIssueType = env.JIRA_STORY_ISSUE_TYPE;
    return {
        baseUrl,
        email,
        apiToken,
        projectKey,
        ...(storyIssueType ? { storyIssueType } : {}),
    };
}
function pullOptionsFromEnv(env) {
    const provider = (env.DNA_LLM_PROVIDER ?? 'anthropic');
    const apiKey = env.DNA_LLM_API_KEY ?? env.ANTHROPIC_API_KEY ?? env.OPENAI_API_KEY ?? env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error('Set DNA_LLM_API_KEY (or a provider-specific key: ANTHROPIC_API_KEY / OPENAI_API_KEY / OPENROUTER_API_KEY).');
    }
    return {
        provider,
        apiKey,
        ...(env.DNA_LLM_MODEL ? { model: env.DNA_LLM_MODEL } : {}),
        ...(env.DNA_LLM_BASE_URL ? { baseUrl: env.DNA_LLM_BASE_URL } : {}),
        ...(env.DNA_LLM_INSTRUCTIONS ? { instructions: env.DNA_LLM_INSTRUCTIONS } : {}),
    };
}
function requireFlag(args, name) {
    const value = args.flags[name];
    if (typeof value !== 'string') {
        console.error(`--${name} <value> is required`);
        return null;
    }
    return value;
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
    console.log(`integration-jira — Jira Epic ⇄ DNA ⇄ Jira Stories

Usage:
  integration-jira pull   --epic <KEY> --out <dna.json> [--dump-text [<path>]]
  integration-jira push   --epic <KEY> --in  <dna.json> [--dry-run] [--labels a,b,c] [--style STYLE]
  integration-jira update --epic <KEY> --in  <dna.json> [--style STYLE]
  integration-jira sync   --epic <KEY>

  --style STYLE   Body template for each Capability Story. One of:
                    user-story  (default) As a / I want / So that + acceptance
                    gherkin     Feature / Scenario / Given / When / Then
                    product-dna Actor / Resource / Action / Trigger / Pre- / Postconditions

  update: find existing dna-labeled child Stories under <KEY> and PUT
  refreshed summary + description to each. Use after re-rendering to
  refresh formatting without creating duplicates.

  --dump-text writes the extracted Epic prose (what gets fed to input-text) to
  <path>, or to <out>.epic.txt when no path is given. Useful for debugging LLM
  output — lets you see exactly what the model was asked to parse.

Environment (Jira):
  JIRA_BASE_URL             https://<site>.atlassian.net
  JIRA_EMAIL                Atlassian account email
  JIRA_API_TOKEN            Atlassian API token (not a password)
  JIRA_PROJECT_KEY          Project key (e.g. ENG)
  JIRA_STORY_ISSUE_TYPE     Issue type for generated children (default: Story)

Environment (LLM for pull):
  DNA_LLM_PROVIDER          anthropic | openai | openrouter (default: anthropic)
  DNA_LLM_API_KEY           Provider API key (or ANTHROPIC_API_KEY / OPENAI_API_KEY / OPENROUTER_API_KEY)
  DNA_LLM_MODEL             Override the provider default model
  DNA_LLM_BASE_URL          Override the provider base URL
  DNA_LLM_INSTRUCTIONS      Extra guidance appended to the input-text system prompt
`);
}
//# sourceMappingURL=cli.js.map