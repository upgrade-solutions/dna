"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotImplementedError = void 0;
exports.default = googleDriveIntegration;
class NotImplementedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotImplementedError';
    }
}
exports.NotImplementedError = NotImplementedError;
/**
 * Default factory for `@dna-codes/dna-integration-google-drive`.
 *
 * **Stub.** Real Google Drive auth + API calls are explicitly out of scope
 * for this package version — see the package README for the migration
 * path. Use the `mock` option to drive integration-shaped flows in tests
 * and downstream development today.
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
//# sourceMappingURL=index.js.map