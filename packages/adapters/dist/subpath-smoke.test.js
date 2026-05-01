"use strict";
/**
 * Confirms each documented subpath resolves to a module with the expected
 * top-level export. Catches drift between the `exports` map, the actual
 * folder layout, and the per-adapter index's named exports.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const DIST_ROOT = path.resolve(__dirname, '..', 'dist');
const CHECKS = [
    { subpath: 'input/json', modulePath: 'input/json/index.js', expectedExport: 'parse' },
    { subpath: 'input/openapi', modulePath: 'input/openapi/index.js', expectedExport: 'parse' },
    { subpath: 'input/text', modulePath: 'input/text/index.js', expectedExport: 'parse' },
    { subpath: 'input/example', modulePath: 'input/example/index.js', expectedExport: 'parse' },
    { subpath: 'output/markdown', modulePath: 'output/markdown/index.js', expectedExport: 'render' },
    { subpath: 'output/html', modulePath: 'output/html/index.js', expectedExport: 'render' },
    { subpath: 'output/mermaid', modulePath: 'output/mermaid/index.js', expectedExport: 'render' },
    { subpath: 'output/openapi', modulePath: 'output/openapi/index.js', expectedExport: 'render' },
    { subpath: 'output/text', modulePath: 'output/text/index.js', expectedExport: 'render' },
    { subpath: 'output/example', modulePath: 'output/example/index.js', expectedExport: 'render' },
    { subpath: 'integration/jira', modulePath: 'integration/jira/index.js', expectedExport: 'createClient' },
    { subpath: 'integration/google-drive', modulePath: 'integration/google-drive/index.js', expectedExport: 'googleDriveIntegration' },
    { subpath: 'integration/example', modulePath: 'integration/example/index.js', expectedExport: 'createClient' },
];
describe('subpath imports', () => {
    for (const c of CHECKS) {
        it(`@dna-codes/dna-adapters/${c.subpath} → ${c.expectedExport}`, () => {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const mod = require(path.join(DIST_ROOT, c.modulePath));
            expect(mod).toBeDefined();
            expect(mod[c.expectedExport]).toBeDefined();
        });
    }
});
//# sourceMappingURL=subpath-smoke.test.js.map