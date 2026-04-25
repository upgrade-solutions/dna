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
exports.bookshopInput = exports.DnaValidator = exports.layerDirs = exports.documents = exports.schemas = exports.SCHEMA_ROOT = void 0;
exports.resolveSchemaFile = resolveSchemaFile;
exports.allSchemas = allSchemas;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
exports.SCHEMA_ROOT = path.dirname(require.resolve('@dna-codes/schemas/package.json'));
function load(rel) {
    const file = path.join(exports.SCHEMA_ROOT, rel);
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
}
exports.schemas = {
    operational: {
        action: load('operational/action.json'),
        attribute: load('operational/attribute.json'),
        domain: load('operational/domain.json'),
        equation: load('operational/equation.json'),
        group: load('operational/group.json'),
        membership: load('operational/membership.json'),
        operation: load('operational/operation.json'),
        outcome: load('operational/outcome.json'),
        person: load('operational/person.json'),
        process: load('operational/process.json'),
        relationship: load('operational/relationship.json'),
        resource: load('operational/resource.json'),
        role: load('operational/role.json'),
        rule: load('operational/rule.json'),
        signal: load('operational/signal.json'),
        task: load('operational/task.json'),
        trigger: load('operational/trigger.json'),
    },
    product: {
        core: {
            action: load('product/core/action.json'),
            field: load('product/core/field.json'),
            operation: load('product/core/operation.json'),
            resource: load('product/core/resource.json'),
        },
        api: {
            endpoint: load('product/api/endpoint.json'),
            namespace: load('product/api/namespace.json'),
            param: load('product/api/param.json'),
            schema: load('product/api/schema.json'),
        },
        web: {
            block: load('product/web/block.json'),
            layout: load('product/web/layout.json'),
            page: load('product/web/page.json'),
            route: load('product/web/route.json'),
        },
    },
    technical: {
        cell: load('technical/cell.json'),
        connection: load('technical/connection.json'),
        construct: load('technical/construct.json'),
        environment: load('technical/environment.json'),
        node: load('technical/node.json'),
        output: load('technical/output.json'),
        provider: load('technical/provider.json'),
        script: load('technical/script.json'),
        variable: load('technical/variable.json'),
        view: load('technical/view.json'),
        zone: load('technical/zone.json'),
    },
};
exports.documents = {
    operational: load('operational/operational.json'),
    productCore: load('product/product.core.json'),
    productApi: load('product/product.api.json'),
    productUi: load('product/product.ui.json'),
    technical: load('technical/technical.json'),
};
exports.layerDirs = {
    operational: path.join(exports.SCHEMA_ROOT, 'operational'),
    product: path.join(exports.SCHEMA_ROOT, 'product'),
    technical: path.join(exports.SCHEMA_ROOT, 'technical'),
};
function resolveSchemaFile(family, name) {
    const dir = exports.layerDirs[family];
    if (!dir)
        return null;
    const candidate = path.join(dir, `${name}.json`);
    return fs.existsSync(candidate) ? candidate : null;
}
function allSchemas() {
    const out = [];
    const walk = (node) => {
        if (!node || typeof node !== 'object')
            return;
        const obj = node;
        if (typeof obj.$id === 'string') {
            out.push(obj);
            return;
        }
        for (const v of Object.values(obj))
            walk(v);
    };
    walk(exports.schemas);
    walk(exports.documents);
    return out;
}
var validator_1 = require("./validator");
Object.defineProperty(exports, "DnaValidator", { enumerable: true, get: function () { return validator_1.DnaValidator; } });
var bookshop_1 = require("./fixtures/bookshop");
Object.defineProperty(exports, "bookshopInput", { enumerable: true, get: function () { return bookshop_1.bookshopInput; } });
//# sourceMappingURL=index.js.map