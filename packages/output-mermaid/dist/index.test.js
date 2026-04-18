"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const core_1 = require("@dna-codes/core");
describe('@dna-codes/output-mermaid', () => {
    describe('render() — defaults and options', () => {
        it('emits both default diagrams', () => {
            const out = (0, index_1.render)(core_1.bookshopInput);
            expect(out).toContain('erDiagram');
            expect(out).toContain('flowchart TD');
        });
        it('honors an explicit diagrams list', () => {
            const erdOnly = (0, index_1.render)(core_1.bookshopInput, { diagrams: ['erd'] });
            expect(erdOnly).toContain('erDiagram');
            expect(erdOnly).not.toContain('flowchart');
            const flowOnly = (0, index_1.render)(core_1.bookshopInput, { diagrams: ['flowchart'] });
            expect(flowOnly).toContain('flowchart TD');
            expect(flowOnly).not.toContain('erDiagram');
        });
        it('applies flowchartDirection option', () => {
            const lr = (0, index_1.render)(core_1.bookshopInput, { diagrams: ['flowchart'], flowchartDirection: 'LR' });
            expect(lr).toContain('flowchart LR');
            expect(lr).not.toContain('flowchart TD');
        });
        it('emits the empty string when DNA is empty', () => {
            expect((0, index_1.render)({})).toBe('');
        });
        it('skips diagrams whose data is missing', () => {
            const noProcess = {
                operational: {
                    ...core_1.bookshopInput.operational,
                    processes: [],
                },
            };
            const out = (0, index_1.render)(noProcess);
            expect(out).toContain('erDiagram');
            expect(out).not.toContain('flowchart');
        });
    });
    describe('diagram: erd', () => {
        it('emits an entity block per noun with attributes', () => {
            const out = (0, index_1.render)(core_1.bookshopInput, { diagrams: ['erd'] });
            expect(out).toContain('Book {');
            expect(out).toContain('string id');
            expect(out).toContain('string title');
            expect(out).toContain('enum status');
            expect(out).toContain('Author {');
            expect(out).toContain('string name');
        });
        it('emits a relationship edge with the mapped cardinality', () => {
            const out = (0, index_1.render)(core_1.bookshopInput, { diagrams: ['erd'] });
            // many-to-one → }o--||
            expect(out).toContain('Book }o--|| Author : "Book.author"');
        });
        it('emits an empty entity block for nouns without attributes', () => {
            const out = (0, index_1.render)({
                operational: {
                    domain: { name: 'd', nouns: [{ name: 'Empty' }] },
                },
            }, { diagrams: ['erd'] });
            expect(out).toContain('Empty {');
            expect(out).toContain('}');
        });
    });
    describe('diagram: flowchart', () => {
        it('emits a subgraph per process', () => {
            const out = (0, index_1.render)(core_1.bookshopInput, { diagrams: ['flowchart'] });
            expect(out).toContain('subgraph PublishFlow["PublishFlow"]');
            expect(out).toContain('end');
        });
        it('emits step nodes labeled by each task\'s capability', () => {
            const out = (0, index_1.render)(core_1.bookshopInput, { diagrams: ['flowchart'] });
            expect(out).toContain('review["Book.Publish"]');
            expect(out).toContain('approve["Book.Publish"]');
            expect(out).toContain('reject["Book.Retire"]');
        });
        it('emits arrows with when/else labels for branches', () => {
            const out = (0, index_1.render)(core_1.bookshopInput, { diagrams: ['flowchart'] });
            expect(out).toContain('review -- "passed" --> approve');
            expect(out).toContain('review -- "else" --> reject');
        });
        it('emits an unlabeled arrow when there is no branch', () => {
            const out = (0, index_1.render)({
                operational: {
                    domain: { name: 'd' },
                    tasks: [{ name: 'T1', capability: 'Thing.Do' }],
                    processes: [
                        {
                            name: 'Simple',
                            steps: [
                                { id: 'a', task: 'T1' },
                                { id: 'b', task: 'T1', depends_on: ['a'] },
                            ],
                        },
                    ],
                },
            }, { diagrams: ['flowchart'] });
            expect(out).toContain('a --> b');
            expect(out).not.toContain('"passed"');
            expect(out).not.toContain('"else"');
        });
    });
});
//# sourceMappingURL=index.test.js.map