"use strict";
/**
 * Exports-coverage check: every adapter folder under
 * `src/{input,output,integration}/<name>/` has a matching `./` + kind +
 * `/` + name entry in `package.json#exports`, and every entry in that
 * exports map (other than `./package.json`) maps to an `index.ts` that
 * actually exists. Catches drift in either direction.
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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const PKG_DIR = path.resolve(__dirname, '..');
const SRC = path.join(PKG_DIR, 'src');
const KINDS = ['input', 'output', 'integration'];
function readExports() {
    const pkg = JSON.parse(fs.readFileSync(path.join(PKG_DIR, 'package.json'), 'utf-8'));
    const exports = pkg.exports ?? {};
    const out = [];
    for (const [subpath, body] of Object.entries(exports)) {
        if (subpath === './package.json')
            continue;
        if (typeof body === 'string') {
            out.push({ subpath, defaultPath: body, typesPath: body });
            continue;
        }
        out.push({
            subpath,
            defaultPath: body.default ?? '',
            typesPath: body.types ?? '',
        });
    }
    return out;
}
function adapterFolders() {
    const out = [];
    for (const kind of KINDS) {
        const kindDir = path.join(SRC, kind);
        if (!fs.existsSync(kindDir))
            continue;
        for (const name of fs.readdirSync(kindDir)) {
            const dir = path.join(kindDir, name);
            if (fs.statSync(dir).isDirectory())
                out.push({ kind, name });
        }
    }
    return out;
}
describe('exports coverage', () => {
    it('every adapter folder has a corresponding exports entry', () => {
        const exportsBySubpath = new Set(readExports().map((e) => e.subpath));
        const missing = [];
        for (const { kind, name } of adapterFolders()) {
            const expected = `./${kind}/${name}`;
            if (!exportsBySubpath.has(expected))
                missing.push(expected);
        }
        expect(missing).toEqual([]);
    });
    it('every exports entry has a matching adapter folder with an index.ts', () => {
        const orphans = [];
        for (const e of readExports()) {
            const m = /^\.\/(input|output|integration)\/([^/]+)$/.exec(e.subpath);
            if (!m)
                continue;
            const [, kind, name] = m;
            const indexTs = path.join(SRC, kind, name, 'index.ts');
            if (!fs.existsSync(indexTs))
                orphans.push(`${e.subpath} → ${path.relative(PKG_DIR, indexTs)} missing`);
        }
        expect(orphans).toEqual([]);
    });
    it('package.json declares no root entry — every consumer imports via subpath', () => {
        const pkg = JSON.parse(fs.readFileSync(path.join(PKG_DIR, 'package.json'), 'utf-8'));
        expect(pkg.exports['.']).toBeUndefined();
    });
});
//# sourceMappingURL=exports-coverage.test.js.map