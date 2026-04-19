"use strict";
/**
 * @dna-codes/integration-example — template integration package.
 *
 * An `integration-*` connects an external system to DNA bidirectionally.
 * It owns three surfaces:
 *
 *   1. Outbound API calls   — createClient()  (client.ts)
 *   2. Inbound webhooks     — parseWebhook()  (webhook.ts)
 *   3. A CLI                — runCli()        (cli.ts, bin/)
 *
 * Unlike input-* and output-*, an integration may depend on @dna-codes/core
 * at runtime — e.g. for validation before pushing. This template stays
 * zero-dep so fork it as-is, then add runtime deps deliberately.
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCli = exports.itemToResource = exports.itemsToDna = exports.dnaToItems = exports.WebhookError = exports.verifySignature = exports.parseWebhook = exports.createNodeHandler = exports.createClient = void 0;
var client_1 = require("./client");
Object.defineProperty(exports, "createClient", { enumerable: true, get: function () { return client_1.createClient; } });
var webhook_1 = require("./webhook");
Object.defineProperty(exports, "createNodeHandler", { enumerable: true, get: function () { return webhook_1.createNodeHandler; } });
Object.defineProperty(exports, "parseWebhook", { enumerable: true, get: function () { return webhook_1.parseWebhook; } });
Object.defineProperty(exports, "verifySignature", { enumerable: true, get: function () { return webhook_1.verifySignature; } });
Object.defineProperty(exports, "WebhookError", { enumerable: true, get: function () { return webhook_1.WebhookError; } });
var mapping_1 = require("./mapping");
Object.defineProperty(exports, "dnaToItems", { enumerable: true, get: function () { return mapping_1.dnaToItems; } });
Object.defineProperty(exports, "itemsToDna", { enumerable: true, get: function () { return mapping_1.itemsToDna; } });
Object.defineProperty(exports, "itemToResource", { enumerable: true, get: function () { return mapping_1.itemToResource; } });
var cli_1 = require("./cli");
Object.defineProperty(exports, "runCli", { enumerable: true, get: function () { return cli_1.runCli; } });
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map