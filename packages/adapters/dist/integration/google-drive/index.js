"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotImplementedError = void 0;
exports.googleDriveIntegration = googleDriveIntegration;
class NotImplementedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotImplementedError';
    }
}
exports.NotImplementedError = NotImplementedError;
/**
 * Factory for `@dna-codes/dna-integration-google-drive`.
 *
 * **Stub.** Real Google Drive auth + API calls are explicitly out of scope
 * for this package version — see the package README for the migration
 * path. Use the `mock` option to drive integration-shaped flows in tests
 * and downstream development today.
 *
 * Available as both a named export and the default export. Prefer the
 * named export from Node ESM consumers — Node's CJS-interop semantics
 * make `import googleDriveIntegration from '...'` bind to the wrapping
 * module object rather than the function itself.
 */
function googleDriveIntegration(opts = {}) {
    const mock = opts.mock ?? {};
    return {
        async fetch(uri) {
            const entry = mock[uri];
            if (!entry) {
                throw new NotImplementedError(`@dna-codes/dna-integration-google-drive: real Google Drive API is not yet wired (uri: ${uri}). Pass a \`mock\` map to googleDriveIntegration({ mock: { [uri]: { contents, mimeType } } }) for now.`);
            }
            return {
                contents: entry.contents,
                mimeType: entry.mimeType,
                source: { uri, loadedAt: new Date().toISOString() },
            };
        },
    };
}
exports.default = googleDriveIntegration;
//# sourceMappingURL=index.js.map