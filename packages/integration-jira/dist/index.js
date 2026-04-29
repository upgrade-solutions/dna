"use strict";
/**
 * @dna-codes/dna-integration-jira — bidirectional Jira Cloud integration.
 *
 *   Jira Epic ──▶ input-text ──▶ DNA ──▶ output-text ──▶ Jira Stories
 *
 * One Capability in the DNA becomes one child Story under the Epic.
 * The Epic's description is fed into @dna-codes/dna-input-text (LLM-backed);
 * each Capability is rendered by @dna-codes/dna-output-text.renderMany.
 *
 * No webhook surface — Jira Cloud's native outbound webhooks are not
 * signed in a way external verifiers can safely validate. Use Jira
 * Automation with a signed HTTP action if you need inbound events.
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
exports.runCli = exports.fromMarkdown = exports.extractText = exports.dnaToStoryFields = exports.createClient = void 0;
var client_1 = require("./client");
Object.defineProperty(exports, "createClient", { enumerable: true, get: function () { return client_1.createClient; } });
var mapping_1 = require("./mapping");
Object.defineProperty(exports, "dnaToStoryFields", { enumerable: true, get: function () { return mapping_1.dnaToStoryFields; } });
var adf_1 = require("./adf");
Object.defineProperty(exports, "extractText", { enumerable: true, get: function () { return adf_1.extractText; } });
Object.defineProperty(exports, "fromMarkdown", { enumerable: true, get: function () { return adf_1.fromMarkdown; } });
var cli_1 = require("./cli");
Object.defineProperty(exports, "runCli", { enumerable: true, get: function () { return cli_1.runCli; } });
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map