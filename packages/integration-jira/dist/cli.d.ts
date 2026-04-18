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
type ArgMap = {
    positional: string[];
    flags: Record<string, string | boolean>;
};
export declare function runCli(argv: string[], env?: NodeJS.ProcessEnv): Promise<number>;
export declare function parseArgs(argv: string[]): ArgMap;
export {};
//# sourceMappingURL=cli.d.ts.map