"use strict";
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
exports.fileIntegration = fileIntegration;
exports.resolveFilePath = resolveFilePath;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const url = __importStar(require("url"));
const EXT_TO_MIME = {
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.markdown': 'text/markdown',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.json': 'application/json',
    '.yaml': 'application/yaml',
    '.yml': 'application/yaml',
    '.xml': 'application/xml',
    '.csv': 'text/csv',
    '.tsv': 'text/tab-separated-values',
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
};
const TEXT_MIMES = new Set([
    'text/plain',
    'text/markdown',
    'text/html',
    'text/csv',
    'text/tab-separated-values',
    'application/json',
    'application/yaml',
    'application/xml',
]);
/**
 * Built-in fetcher for `file://` URIs and bare filesystem paths. Used
 * internally by the orchestrator and exported so callers can test
 * integration-shaped flows without reaching for private internals.
 */
function fileIntegration() {
    return {
        async fetch(uri) {
            const filePath = resolveFilePath(uri);
            const ext = path.extname(filePath).toLowerCase();
            const mimeType = EXT_TO_MIME[ext] ?? 'application/octet-stream';
            const contents = TEXT_MIMES.has(mimeType)
                ? fs.readFileSync(filePath, 'utf-8')
                : fs.readFileSync(filePath);
            return {
                contents,
                mimeType,
                source: {
                    uri,
                    loadedAt: new Date().toISOString(),
                },
            };
        },
    };
}
/**
 * Convert a `file://` URI or bare path to an absolute filesystem path.
 * Exported for test reuse.
 */
function resolveFilePath(uri) {
    if (uri.startsWith('file://'))
        return url.fileURLToPath(uri);
    return path.resolve(uri);
}
//# sourceMappingURL=file-integration.js.map