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
                        { name: 'Publish', description: 'Publish a draft book.' },
                        { name: 'Retire', description: 'Retire an active book.' },
                    ],
                },
                {
                    name: 'Author',
                    description: 'A book\'s author.',
                    attributes: [
                        { name: 'id', type: 'string', required: true },
                        { name: 'name', type: 'string', required: true },
                    ],
                },
                {
                    name: 'Editor',
                    description: 'Reviews and publishes books. Acts as a Role.',
                },
                {
                    name: 'Ada',
                    description: 'Named individual; documentation roster entry.',
                    memberships: [{ role: 'Editor', in: 'Shop' }],
                },
                {
                    name: 'Shop',
                    description: 'The bookshop itself. Acts as the Group scoping editor memberships.',
                },
            ],
        },
        operations: [
            {
                name: 'Book.Publish',
                resource: 'Book',
                action: 'Publish',
                description: 'Publish a draft book to the storefront.',
            },
            {
                name: 'Book.Retire',
                resource: 'Book',
                action: 'Retire',
                description: 'Remove an active book from sale.',
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
        outcomes: [
            {
                operation: 'Book.Publish',
                changes: [{ attribute: 'book.status', set: 'active' }],
                emits: ['shop.Book.Published'],
            },
        ],
        triggers: [
            {
                operation: 'Book.Publish',
                source: 'user',
                description: 'Editor publishes a book.',
            },
        ],
        signals: [
            {
                name: 'shop.Book.Published',
                operation: 'Book.Publish',
                description: 'Emitted when a book goes live on the storefront.',
                payload: [{ name: 'book_id', type: 'string', required: true }],
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