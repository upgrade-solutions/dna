/**
 * Loose DNA subset consumed/emitted by the integration.
 *
 * Like output-*, we keep these local rather than importing from @dna-codes/dna-core
 * so the package stays zero-dep and tolerates partial DNA.
 */
export interface DnaInput {
    operational?: OperationalDna;
}
export interface OperationalDna {
    domain: OperationalDomain;
}
export interface OperationalDomain {
    name: string;
    path?: string;
    resources?: Resource[];
}
export interface Resource {
    name: string;
    description?: string;
    attributes?: Attribute[];
    metadata?: {
        tags?: string[];
        externalId?: string;
    };
}
export interface Attribute {
    name: string;
    type: string;
    required?: boolean;
}
//# sourceMappingURL=dna-types.d.ts.map