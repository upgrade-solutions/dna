/**
 * Loose structural types describing the DNA shapes this renderer reads.
 *
 * Intentionally a subset of the canonical schemas in @dna-codes/dna-schemas
 * (surfaced as types via @dna-codes/dna-core) — only the fields this renderer
 * consumes are modeled. That keeps the package zero-dependency and lets
 * callers hand in partially-populated DNA without tripping type errors
 * on unrelated fields.
 *
 * When forking, copy just the layers/fields you need. Don't import the
 * full canonical types — stay loose.
 */
export interface DnaInput {
    operational?: OperationalDna;
}
export interface OperationalDna {
    domain: OperationalDomain;
    capabilities?: Capability[];
    relationships?: Relationship[];
}
export interface OperationalDomain {
    name: string;
    path?: string;
    description?: string;
    resources?: Resource[];
    domains?: OperationalDomain[];
}
export interface Resource {
    name: string;
    attributes?: Attribute[];
    actions?: Action[];
}
export interface Attribute {
    name: string;
    type: string;
    required?: boolean;
}
export interface Action {
    name: string;
    description?: string;
}
export interface Capability {
    resource: string;
    action: string;
    name: string;
    description?: string;
}
export interface Relationship {
    name: string;
    from: string;
    to: string;
    cardinality: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
}
//# sourceMappingURL=types.d.ts.map