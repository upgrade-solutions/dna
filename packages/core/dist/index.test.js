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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const index_1 = require("./index");
describe('@dna-codes/core', () => {
    describe('schemas', () => {
        it('loads all 15 operational primitive schemas', () => {
            const op = index_1.schemas.operational;
            expect(Object.keys(op).sort()).toEqual([
                'attribute',
                'capability',
                'cause',
                'domain',
                'equation',
                'noun',
                'outcome',
                'person',
                'position',
                'process',
                'relationship',
                'rule',
                'signal',
                'task',
                'verb',
            ]);
            for (const s of Object.values(op)) {
                expect(typeof s.$id).toBe('string');
                expect(s.$id.startsWith('https://dna.local/operational/')).toBe(true);
            }
        });
        it('loads product core/api/web schemas under the right namespaces', () => {
            expect(Object.keys(index_1.schemas.product.core).sort()).toEqual(['action', 'field', 'operation', 'resource', 'role']);
            expect(Object.keys(index_1.schemas.product.api).sort()).toEqual(['endpoint', 'namespace', 'param', 'schema']);
            expect(Object.keys(index_1.schemas.product.web).sort()).toEqual(['block', 'layout', 'page', 'route']);
        });
        it('loads all 11 technical primitive schemas', () => {
            expect(Object.keys(index_1.schemas.technical).sort()).toEqual([
                'cell',
                'connection',
                'construct',
                'environment',
                'node',
                'output',
                'provider',
                'script',
                'variable',
                'view',
                'zone',
            ]);
        });
    });
    describe('documents', () => {
        it('loads the five layer aggregate schemas', () => {
            expect(Object.keys(index_1.documents).sort()).toEqual([
                'operational',
                'productApi',
                'productCore',
                'productUi',
                'technical',
            ]);
            for (const d of Object.values(index_1.documents)) {
                expect(typeof d.$id).toBe('string');
            }
        });
    });
    describe('allSchemas', () => {
        it('returns every primitive + aggregate schema exactly once', () => {
            const all = (0, index_1.allSchemas)();
            const ids = all.map((s) => s.$id);
            expect(new Set(ids).size).toBe(ids.length);
            // 15 op + 5 product-core + 4 product-api + 4 product-web + 11 technical = 39 primitives
            // + 5 aggregates = 44 schemas total
            expect(all.length).toBe(44);
        });
    });
    describe('resolveSchemaFile', () => {
        it('resolves a top-level primitive file', () => {
            const p = (0, index_1.resolveSchemaFile)('operational', 'noun');
            expect(p).not.toBeNull();
            expect(fs.existsSync(p)).toBe(true);
            expect(path.basename(p)).toBe('noun.json');
        });
        it('resolves a nested product primitive via subpath', () => {
            const p = (0, index_1.resolveSchemaFile)('product', 'api/endpoint');
            expect(p).not.toBeNull();
            expect(p.endsWith(path.join('product', 'api', 'endpoint.json'))).toBe(true);
        });
        it('returns null for a missing schema', () => {
            expect((0, index_1.resolveSchemaFile)('operational', 'ghost')).toBeNull();
        });
    });
    describe('SCHEMA_ROOT and layerDirs', () => {
        it('SCHEMA_ROOT points at a directory that contains the three layer folders', () => {
            expect(fs.existsSync(index_1.SCHEMA_ROOT)).toBe(true);
            expect(fs.existsSync(index_1.layerDirs.operational)).toBe(true);
            expect(fs.existsSync(index_1.layerDirs.product)).toBe(true);
            expect(fs.existsSync(index_1.layerDirs.technical)).toBe(true);
        });
    });
});
//# sourceMappingURL=index.test.js.map