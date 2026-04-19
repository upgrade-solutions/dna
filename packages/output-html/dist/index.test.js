"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const core_1 = require("@dna-codes/core");
describe('@dna-codes/output-html', () => {
    describe('render() — document scaffolding', () => {
        it('renders every default section', () => {
            const html = (0, index_1.render)(core_1.bookshopInput);
            expect(html).toContain('<h1>shop.books</h1>');
            expect(html).toContain('<h2>Summary</h2>');
            expect(html).toContain('<h2>Domain Model</h2>');
            expect(html).toContain('<h2>Capabilities</h2>');
            expect(html).toContain('<h2>SOPs</h2>');
            expect(html).toContain('<h2>Process Flows</h2>');
        });
        it('honors an explicit sections list and drops the rest', () => {
            const html = (0, index_1.render)(core_1.bookshopInput, { sections: ['summary'] });
            expect(html).toContain('<h2>Summary</h2>');
            expect(html).not.toContain('<h2>Domain Model</h2>');
            expect(html).not.toContain('<h2>Capabilities</h2>');
            expect(html).not.toContain('<h2>SOPs</h2>');
            expect(html).not.toContain('<h2>Process Flows</h2>');
        });
        it('supports a custom title override', () => {
            const html = (0, index_1.render)(core_1.bookshopInput, { title: 'Bookshop Handbook' });
            expect(html).toContain('<h1>Bookshop Handbook</h1>');
            expect(html).not.toContain('<h1>shop.books</h1>');
        });
        it('falls back to domain.name when path is missing', () => {
            const noPath = {
                operational: {
                    ...core_1.bookshopInput.operational,
                    domain: { ...core_1.bookshopInput.operational.domain, path: undefined },
                },
            };
            expect((0, index_1.render)(noPath)).toContain('<h1>shop</h1>');
        });
        it('shifts heading levels with headingLevel: 2', () => {
            const html = (0, index_1.render)(core_1.bookshopInput, {
                sections: ['summary'],
                headingLevel: 2,
            });
            expect(html).toContain('<h2>shop.books</h2>');
            expect(html).toContain('<h3>Summary</h3>');
        });
        it('emits the empty string when DNA is empty', () => {
            expect((0, index_1.render)({})).toBe('');
        });
        it('wraps output as a full HTML document when standalone is true', () => {
            const html = (0, index_1.render)(core_1.bookshopInput, { sections: ['summary'], standalone: true });
            expect(html).toMatch(/^<!DOCTYPE html><html>/);
            expect(html).toContain('<title>shop.books</title>');
            expect(html).toContain('<body>');
            expect(html.endsWith('</html>')).toBe(true);
        });
        it('HTML-escapes dangerous characters in titles and descriptions', () => {
            const dangerous = {
                operational: {
                    ...core_1.bookshopInput.operational,
                    domain: {
                        ...core_1.bookshopInput.operational.domain,
                        path: undefined,
                        description: '<script>alert(1)</script>',
                    },
                },
            };
            const html = (0, index_1.render)(dangerous, { title: '<evil>', sections: [] });
            expect(html).toContain('&lt;evil&gt;');
            expect(html).toContain('&lt;script&gt;');
            expect(html).not.toContain('<script>');
        });
    });
    describe('section: summary', () => {
        it('lists primitive counts for populated collections only', () => {
            const html = (0, index_1.render)(core_1.bookshopInput, { sections: ['summary'] });
            expect(html).toContain('Resources: 2');
            expect(html).toContain('Capabilities: 2');
            expect(html).toContain('Rules: 2');
            expect(html).toContain('Processes: 1');
            expect(html).not.toContain('Equations:');
        });
        it('names top-level resources', () => {
            const html = (0, index_1.render)(core_1.bookshopInput, { sections: ['summary'] });
            expect(html).toContain('Top-level resources:');
            expect(html).toContain('<code>Book</code>');
        });
    });
    describe('section: domain-model', () => {
        it('renders a resource with attribute table, actions, and relationships', () => {
            const html = (0, index_1.render)(core_1.bookshopInput, { sections: ['domain-model'] });
            expect(html).toContain('<h3>Book</h3>');
            expect(html).toContain('<th>Attribute</th>');
            expect(html).toContain('<td><code>id</code></td>');
            expect(html).toContain('<strong>Actions:</strong>');
            expect(html).toContain('<code>Publish</code>');
            expect(html).toContain('<code>Book.author</code>');
            expect(html).toContain('many-to-one');
            expect(html).toContain('<code>Author</code>');
        });
    });
    describe('section: capabilities', () => {
        it('renders triggers, access rules, condition rules, outcomes, and signals', () => {
            const html = (0, index_1.render)(core_1.bookshopInput, { sections: ['capabilities'] });
            expect(html).toContain('<h3>Book.Publish</h3>');
            expect(html).toContain('<strong>Triggered by:</strong>');
            expect(html).toContain('user');
            expect(html).toContain('<em>Access:</em>');
            expect(html).toContain('role <code>Editor</code>');
            expect(html).toContain('<em>Condition:</em>');
            expect(html).toContain('book.status == &quot;draft&quot;');
            expect(html).toContain('<code>book.status</code>');
            expect(html).toContain('<code>shop.Book.Published</code>');
            expect(html).toContain('<strong>Signals published:</strong>');
            expect(html).toContain('<code>book_id</code>');
        });
    });
    describe('section: sops', () => {
        it('renders numbered steps that resolve task → role + capability', () => {
            const html = (0, index_1.render)(core_1.bookshopInput, { sections: ['sops'] });
            expect(html).toContain('<h3>PublishFlow</h3>');
            expect(html).toContain('<strong>Operator:</strong>');
            expect(html).toContain('<code>Editor</code>');
            expect(html).toMatch(/<ol>.*<li>.*<strong>review<\/strong>/s);
            expect(html).toContain('does <code>Book.Publish</code>');
            expect(html).toContain('(when: passed)');
            expect(html).toContain('(else)');
            expect(html).toContain('after: <code>review</code>');
        });
    });
    describe('section: process-flow', () => {
        it('renders a preformatted outline with branch markers and dep arrows', () => {
            const html = (0, index_1.render)(core_1.bookshopInput, { sections: ['process-flow'] });
            expect(html).toContain('<h3>PublishFlow</h3>');
            expect(html).toContain('<pre><code>');
            expect(html).toContain('├── review: ReviewBook');
            expect(html).toContain('├── approve: ApproveBook [when: passed] ← review');
            expect(html).toContain('└── reject: RejectBook [else] ← review');
        });
    });
});
//# sourceMappingURL=index.test.js.map