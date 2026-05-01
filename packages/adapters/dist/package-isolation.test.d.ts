/**
 * Import-isolation enforcement for `@dna-codes/dna-adapters`.
 *
 * Every `.ts` file under `src/{input,output,integration}/<name>/` is
 * scanned for `import` and `require` statements. The rules:
 *
 *   - Library files (everything except `cli.ts` / `cli.test.ts`) MUST NOT
 *     import any sibling adapter, by relative path or by the package's
 *     own subpath self-reference.
 *
 *   - CLI files under `src/integration/<name>/` MAY import sibling
 *     `input/<x>` and `output/<x>` adapters, but ONLY via the package's
 *     published subpath form (`@dna-codes/dna-adapters/...`). Relative
 *     paths into a sibling folder are rejected so the CLI's source is
 *     identical pre- and post-extraction.
 *
 *   - CLI files under `src/input/<x>/` or `src/output/<x>/` MAY NOT use
 *     this carve-out — only integration CLIs may.
 *
 *   - No `src/util/`, `src/shared/`, or other package-level helper
 *     directory may exist (would block extraction).
 */
export {};
//# sourceMappingURL=package-isolation.test.d.ts.map