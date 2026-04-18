export interface ParsedAttribute {
    name: string;
    type: string;
    required?: boolean;
    noun?: string;
}
export interface ParsedNoun {
    name: string;
    attributes: ParsedAttribute[];
}
export interface ParsedRelationship {
    name: string;
    from: string;
    to: string;
    attribute: string;
    cardinality: 'one-to-one' | 'one-to-many';
}
export interface ParsedOperational {
    domain: {
        name: string;
        nouns: ParsedNoun[];
    };
    relationships?: ParsedRelationship[];
}
export interface ParseResult {
    operational: ParsedOperational;
}
//# sourceMappingURL=types.d.ts.map