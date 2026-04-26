"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookshopInput = void 0;
/**
 * Canonical bookshop domain used across adapter tests. Populates every
 * operational primitive any adapter currently consumes so renderers can
 * be asserted against the same input.
 */
exports.bookshopInput = {
    operational: {
        domain: {
            name: 'shop',
            path: 'shop.books',
            description: 'Tiny bookshop domain — canonical fixture for adapter tests.',
            resources: [
                {
                    name: 'Book',
                    description: 'A book for sale.',
                    attributes: [
                        { name: 'id', type: 'string', required: true, description: 'Unique identifier' },
                        { name: 'title', type: 'string', required: true, description: 'Book title' },
                        { name: 'author_id', type: 'reference', required: true, description: 'Reference to Author' },
                        {
                            name: 'status',
                            type: 'enum',
                            required: true,
                            description: 'draft | active | retired',
                        },
                    ],
                    actions: [
                        { name: 'Publish', description: 'Publish a draft book.', type: 'write' },
                        { name: 'Retire', description: 'Retire an active book.', type: 'destructive' },
                    ],
                },
                {
                    name: 'Author',
                    description: "A book's author.",
                    attributes: [
                        { name: 'id', type: 'string', required: true },
                        { name: 'name', type: 'string', required: true },
                    ],
                },
            ],
            persons: [
                {
                    name: 'Employee',
                    description: 'Internal worker at the shop.',
                },
            ],
            groups: [
                {
                    name: 'Shop',
                    description: 'The bookshop itself — the work-unit Editors are scoped to.',
                },
            ],
            roles: [
                {
                    name: 'Editor',
                    description: 'Reviews and publishes books within a Shop.',
                    scope: 'Shop',
                },
            ],
        },
        memberships: [
            {
                name: 'EmployeeEditor',
                description: 'Employees may hold the Editor role within a Shop.',
                person: 'Employee',
                role: 'Editor',
            },
        ],
        operations: [
            {
                name: 'Book.Publish',
                target: 'Book',
                action: 'Publish',
                description: 'Publish a draft book to the storefront.',
                changes: [{ attribute: 'status', set: 'active' }],
            },
            {
                name: 'Book.Retire',
                target: 'Book',
                action: 'Retire',
                description: 'Remove an active book from sale.',
            },
            {
                name: 'PublishFlow.Start',
                target: 'PublishFlow',
                action: 'Start',
                description: 'An Editor kicks off the PublishFlow SOP for a draft book.',
            },
        ],
        rules: [
            { operation: 'Book.Publish', type: 'access', allow: [{ role: 'Editor' }] },
            {
                name: 'BookIsDraft',
                operation: 'Book.Publish',
                type: 'condition',
                conditions: [{ attribute: 'book.status', operator: 'eq', value: 'draft' }],
            },
        ],
        triggers: [
            {
                operation: 'Book.Publish',
                source: 'user',
                description: 'Editor publishes a book.',
            },
        ],
        relationships: [
            {
                name: 'Book.author',
                from: 'Book',
                to: 'Author',
                attribute: 'author_id',
                cardinality: 'many-to-one',
            },
        ],
        tasks: [
            {
                name: 'review-book',
                actor: 'Editor',
                operation: 'Book.Publish',
                description: 'Editor reviews the draft.',
            },
            {
                name: 'approve-book',
                actor: 'Editor',
                operation: 'Book.Publish',
                description: 'Editor approves and publishes.',
            },
            {
                name: 'reject-book',
                actor: 'Editor',
                operation: 'Book.Retire',
                description: 'Editor rejects the draft.',
            },
        ],
        processes: [
            {
                name: 'PublishFlow',
                description: 'How a draft book becomes live.',
                operator: 'Editor',
                startStep: 'review',
                steps: [
                    { id: 'review', task: 'review-book' },
                    {
                        id: 'approve',
                        task: 'approve-book',
                        depends_on: ['review'],
                        conditions: ['BookIsDraft'],
                        else: 'reject',
                    },
                    {
                        id: 'reject',
                        task: 'reject-book',
                        depends_on: ['review'],
                    },
                ],
            },
        ],
    },
};
//# sourceMappingURL=bookshop.js.map