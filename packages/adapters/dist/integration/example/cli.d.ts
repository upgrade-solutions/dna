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
type ArgMap = {
    positional: string[];
    flags: Record<string, string | boolean>;
};
export declare function runCli(argv: string[], env?: NodeJS.ProcessEnv): Promise<number>;
export declare function parseArgs(argv: string[]): ArgMap;
export {};
//# sourceMappingURL=cli.d.ts.map