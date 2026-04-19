"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const core_1 = require("@dna-codes/core");
describe('@dna-codes/output-markdown', () => {
    describe('render() — document scaffolding', () => {
        it('renders every default section', () => {
            const md = (0, index_1.render)(core_1.bookshopInput);
            expect(md).toContain('# shop.books');
            expect(md).toContain('## Summary');
            expect(md).toContain('## Domain Model');
            expect(md).toContain('## Capabilities');
            expect(md).toContain('## SOPs');
            expect(md).toContain('## Process Flows');
        });
        it('honors an explicit sections list and drops the rest', () => {
            const md = (0, index_1.render)(core_1.bookshopInput, { sections: ['summary'] });
            expect(md).toContain('## Summary');
            expect(md).not.toContain('## Domain Model');
            expect(md).not.toContain('## Capabilities');
            expect(md).not.toContain('## SOPs');
            expect(md).not.toContain('## Process Flows');
        });
        it('supports a custom title override', () => {
            const md = (0, index_1.render)(core_1.bookshopInput, { title: 'Bookshop Handbook' });
            expect(md).toContain('# Bookshop Handbook');
            expect(md).not.toContain('# shop.books');
        });
        it('falls back to domain.name when path is missing', () => {
            const noPath = {
                operational: {
                    ...core_1.bookshopInput.operational,
                    domain: { ...core_1.bookshopInput.operational.domain, path: undefined },
                },
            };
            expect((0, index_1.render)(noPath)).toContain('# shop');
        });
        it('shifts heading levels with headingLevel: 2', () => {
            const md = (0, index_1.render)(core_1.bookshopInput, {
                sections: ['summary'],
                headingLevel: 2,
            });
            expect(md).toContain('## shop.books');
            expect(md).toContain('### Summary');
        });
        it('emits the empty string when DNA is empty', () => {
            expect((0, index_1.render)({})).toBe('');
        });
    });
    describe('section: summary', () => {
        it('lists primitive counts for populated collections only', () => {
            const md = (0, index_1.render)(core_1.bookshopInput, { sections: ['summary'] });
            expect(md).toContain('- Resources: 2');
            expect(md).toContain('- Capabilities: 2');
            expect(md).toContain('- Rules: 2');
            expect(md).toContain('- Processes: 1');
            // Equations are absent in the fixture
            expect(md).not.toContain('Equations:');
        });
        it('names top-level resources', () => {
            const md = (0, index_1.render)(core_1.bookshopInput, { sections: ['summary'] });
            expect(md).toContain('**Top-level resources:** `Book`, `Author`');
        });
    });
    describe('section: domain-model', () => {
        it('renders a resource with attribute table, actions, and relationships', () => {
            const md = (0, index_1.render)(core_1.bookshopInput, { sections: ['domain-model'] });
            expect(md).toContain('### Book');
            expect(md).toContain('| Attribute | Type | Required | Description |');
            expect(md).toContain('| `id` | string | yes |');
            expect(md).toContain('**Actions:** `Publish`, `Retire`');
            expect(md).toContain('`Book.author`');
            expect(md).toContain('many-to-one → `Author`');
        });
    });
    describe('section: capabilities', () => {
        it('renders triggers, access rules, condition rules, outcomes, and signals', () => {
            const md = (0, index_1.render)(core_1.bookshopInput, { sections: ['capabilities'] });
            expect(md).toContain('### Book.Publish');
            expect(md).toContain('**Triggered by:**');
            expect(md).toContain('- user');
            expect(md).toContain('*Access:* role `editor`');
            expect(md).toContain('*Condition:* book.status == "draft"');
            expect(md).toContain('Sets `book.status`');
            expect(md).toContain('Emits `shop.Book.Published`');
            expect(md).toContain('**Signals published:**');
            expect(md).toContain('`book_id`: string (required)');
        });
    });
    describe('section: sops', () => {
        it('renders numbered steps that resolve task → position + capability', () => {
            const md = (0, index_1.render)(core_1.bookshopInput, { sections: ['sops'] });
            expect(md).toContain('### PublishFlow');
            expect(md).toContain('**Operator:** `Editor`');
            expect(md).toContain('1. **review** — `Editor` does `Book.Publish`');
            expect(md).toContain('(when: passed)');
            expect(md).toContain('(else)');
            expect(md).toContain('after: `review`');
        });
    });
    describe('section: process-flow', () => {
        it('renders an ASCII outline with branch markers and dep arrows', () => {
            const md = (0, index_1.render)(core_1.bookshopInput, { sections: ['process-flow'] });
            expect(md).toContain('### PublishFlow');
            expect(md).toContain('```');
            expect(md).toContain('├── review: ReviewBook');
            expect(md).toContain('├── approve: ApproveBook [when: passed] ← review');
            expect(md).toContain('└── reject: RejectBook [else] ← review');
        });
    });
});
//# sourceMappingURL=index.test.js.map