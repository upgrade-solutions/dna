/**
 * Bidirectional mapping between the external system's records and DNA.
 *
 * Keep mapping logic isolated from transport (client.ts) and event
 * plumbing (webhook.ts). That way a fork can swap the transport without
 * rewriting the semantic translation — and vice-versa.
 */
import { DnaInput, Resource } from './dna-types';
import { ExternalItem } from './types';
/** Collapse a flat list of external items into an operational DNA slice. */
export declare function itemsToDna(items: ExternalItem[], domain: string): DnaInput;
export declare function itemToResource(item: ExternalItem): Resource;
/** Walk every Resource in a DNA document, ignoring nested sub-domains for brevity. */
export declare function dnaToItems(dna: DnaInput): Omit<ExternalItem, 'id'>[];
//# sourceMappingURL=mapping.d.ts.map