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
const index_1 = __importStar(require("./index"));
describe('googleDriveIntegration (stub)', () => {
    describe('Integration contract shape', () => {
        it('the named factory returns an object with an async fetch method', () => {
            const integration = (0, index_1.googleDriveIntegration)();
            expect(typeof integration.fetch).toBe('function');
        });
        it('the default export is the same factory as the named export', () => {
            expect(index_1.default).toBe(index_1.googleDriveIntegration);
        });
    });
    describe('mocked fetches', () => {
        it('returns the mock contents wrapped in the Integration contract shape', async () => {
            const integration = (0, index_1.googleDriveIntegration)({
                mock: { 'gdrive://abc': { contents: 'hello', mimeType: 'text/plain' } },
            });
            const result = await integration.fetch('gdrive://abc');
            expect(result.contents).toBe('hello');
            expect(result.mimeType).toBe('text/plain');
            expect(result.source.uri).toBe('gdrive://abc');
        });
        it('sets loadedAt at fetch time, not factory construction time', async () => {
            const before = Date.now();
            const integration = (0, index_1.googleDriveIntegration)({
                mock: { 'gdrive://x': { contents: 'x', mimeType: 'text/plain' } },
            });
            // Wait long enough that fetch-time clearly differs from construction-time
            // even on coarse clocks. 5ms is more than enough for any reasonable host.
            await new Promise((r) => setTimeout(r, 5));
            const result = await integration.fetch('gdrive://x');
            const loadedMs = new Date(result.source.loadedAt).getTime();
            expect(loadedMs).toBeGreaterThanOrEqual(before);
            expect(Date.now() - loadedMs).toBeLessThan(1000);
        });
        it('produces an ISO 8601 loadedAt that round-trips through Date', async () => {
            const integration = (0, index_1.googleDriveIntegration)({
                mock: { 'gdrive://x': { contents: '', mimeType: 'text/plain' } },
            });
            const result = await integration.fetch('gdrive://x');
            expect(new Date(result.source.loadedAt).toISOString()).toBe(result.source.loadedAt);
        });
    });
    describe('unmocked fetches', () => {
        it('throws NotImplementedError when the factory has no mock', async () => {
            const integration = (0, index_1.googleDriveIntegration)();
            await expect(integration.fetch('gdrive://anything')).rejects.toMatchObject({
                name: 'NotImplementedError',
            });
        });
        it('throws NotImplementedError when the URI is absent from the mock map', async () => {
            const integration = (0, index_1.googleDriveIntegration)({
                mock: { 'gdrive://abc': { contents: 'x', mimeType: 'text/plain' } },
            });
            await expect(integration.fetch('gdrive://other')).rejects.toMatchObject({
                name: 'NotImplementedError',
            });
        });
        it('error message references both Google Drive and the mock parameter', async () => {
            const integration = (0, index_1.googleDriveIntegration)();
            try {
                await integration.fetch('gdrive://x');
                fail('expected throw');
            }
            catch (err) {
                expect(err).toBeInstanceOf(index_1.NotImplementedError);
                const message = err.message;
                expect(message).toMatch(/Google Drive/i);
                expect(message).toMatch(/mock/i);
            }
        });
    });
});
//# sourceMappingURL=index.test.js.map