"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const dna = {
    operational: {
        domain: {
            name: 'lending',
            path: 'acme.finance.lending',
            description: 'Consumer lending.',
            resources: [
                {
                    name: 'Loan',
                    description: 'A loan applied for by a borrower.',
                    attributes: [
                        { name: 'amount', type: 'number', required: true },
                        { name: 'status', type: 'enum' },
                    ],
                    actions: [{ name: 'Apply' }, { name: 'Approve' }],
                },
            ],
        },
        capabilities: [
            { name: 'Loan.Apply', resource: 'Loan', action: 'Apply', description: 'Submit a loan application.' },
            { name: 'Loan.Approve', resource: 'Loan', action: 'Approve' },
        ],
        causes: [{ capability: 'Loan.Apply', source: 'user' }],
        rules: [
            { capability: 'Loan.Apply', type: 'access', allow: [{ role: 'Borrower' }] },
            { capability: 'Loan.Approve', type: 'access', allow: [{ role: 'Underwriter' }] },
            {
                capability: 'Loan.Approve',
                type: 'condition',
                condition: 'loan.status is pending',
            },
        ],
        outcomes: [
            { capability: 'Loan.Apply', changes: [{ attribute: 'loan.status', set: 'pending' }] },
            { capability: 'Loan.Approve', changes: [{ attribute: 'loan.status', set: 'active' }] },
        ],
        processes: [
            {
                name: 'LoanOnboarding',
                description: 'End-to-end loan onboarding.',
                operator: 'LendingOps',
                steps: [
                    { id: 's1', task: 'SubmitApplication' },
                    { id: 's2', task: 'UnderwriteLoan', depends_on: ['s1'] },
                ],
            },
        ],
        tasks: [
            { name: 'SubmitApplication', role: 'Borrower', capability: 'Loan.Apply' },
            { name: 'UnderwriteLoan', role: 'Underwriter', capability: 'Loan.Approve' },
        ],
        roles: [{ name: 'Borrower' }, { name: 'Underwriter' }],
    },
};
describe('render — single combined document', () => {
    it('renders the capability section with the default user-story style', () => {
        const out = (0, index_1.render)(dna);
        expect(out).toContain('# acme.finance.lending');
        expect(out).toContain('## Capabilities');
        expect(out).toContain('### Apply Loan');
        expect(out).toContain('**As a** Borrower');
        expect(out).not.toContain('## Domain model');
    });
    it('includes other units when their styles are set', () => {
        const out = (0, index_1.render)(dna, {
            styles: { capability: 'user-story', resource: 'product-dna', process: 'product-dna' },
        });
        expect(out).toContain('## Capabilities');
        expect(out).toContain('## Domain model');
        expect(out).toContain('## Processes');
    });
    it('returns empty string for empty DNA', () => {
        expect((0, index_1.render)({})).toBe('');
    });
});
describe('renderMany — defaults', () => {
    it('emits one document per capability with prefixed ids', () => {
        const docs = (0, index_1.renderMany)(dna);
        expect(docs).toHaveLength(2);
        expect(docs[0]).toMatchObject({ id: 'capability-loan-apply', title: 'Apply Loan' });
        expect(docs[1]).toMatchObject({ id: 'capability-loan-approve', title: 'Approve Loan' });
    });
    it('returns an empty array for empty DNA', () => {
        expect((0, index_1.renderMany)({})).toEqual([]);
    });
});
describe('renderMany — styles', () => {
    it('user-story puts As a / I want / So that + acceptance criteria in the body', () => {
        const [apply] = (0, index_1.renderMany)(dna, { styles: { capability: 'user-story' } });
        expect(apply.body).toContain('**As a** Borrower');
        expect(apply.body).toContain('**I want to** apply a loan');
        expect(apply.body).toContain('**Triggered by:**');
        expect(apply.body).toContain('**Acceptance criteria:**');
        expect(apply.body).toContain('Sets `loan.status` to `"pending"`');
    });
    it('gherkin renders Feature / Scenario / Given / When / Then', () => {
        const [, approve] = (0, index_1.renderMany)(dna, { styles: { capability: 'gherkin' } });
        expect(approve.body).toContain('Feature: Approve Loan');
        expect(approve.body).toContain('Scenario:');
        expect(approve.body).toContain('Given an actor with role `Underwriter`');
        expect(approve.body).toContain('And loan.status is pending');
        expect(approve.body).toContain('When they approve the loan');
        expect(approve.body).toContain('Then Sets `loan.status` to `"active"`');
    });
    it('product-dna renders Resource / Action / Actor / pre- and postconditions', () => {
        const [, approve] = (0, index_1.renderMany)(dna, { styles: { capability: 'product-dna' } });
        expect(approve.body).toContain('**Resource:** `Loan`');
        expect(approve.body).toContain('**Action:** `Approve`');
        expect(approve.body).toContain('**Actor:** `Underwriter`');
        expect(approve.body).toContain('**Preconditions:**');
        expect(approve.body).toContain('- loan.status is pending');
        expect(approve.body).toContain('**Postconditions:**');
        expect(approve.body).toContain('- Sets `loan.status` to `"active"`');
    });
});
describe('renderMany — multi-unit', () => {
    it('returns docs for every unit in the styles map, in canonical order', () => {
        const docs = (0, index_1.renderMany)(dna, {
            styles: { capability: 'product-dna', resource: 'product-dna', process: 'product-dna' },
        });
        const ids = docs.map((d) => d.id);
        expect(ids).toEqual([
            'capability-loan-apply',
            'capability-loan-approve',
            'resource-loan',
            'process-loan-onboarding',
        ]);
    });
    it('resource body uses product-dna vocabulary', () => {
        const [r] = (0, index_1.renderMany)(dna, { styles: { resource: 'product-dna' } });
        expect(r.id).toBe('resource-loan');
        expect(r.body).toContain('**Resource:** `Loan`');
        expect(r.body).toContain('**Fields:**');
        expect(r.body).toContain('`amount`: number (required)');
        expect(r.body).toContain('**Actions:**');
    });
    it('process body uses Operation / Role / Steps vocabulary', () => {
        const [p] = (0, index_1.renderMany)(dna, { styles: { process: 'product-dna' } });
        expect(p.id).toBe('process-loan-onboarding');
        expect(p.body).toContain('**Operation:** `LoanOnboarding`');
        expect(p.body).toContain('**Role:** `LendingOps`');
        expect(p.body).toContain('**Steps:**');
        expect(p.body).toContain('(after: s1)');
    });
});
//# sourceMappingURL=index.test.js.map