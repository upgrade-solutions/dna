"use strict";
/**
 * Bidirectional mapping between the external system's records and DNA.
 *
 * Keep mapping logic isolated from transport (client.ts) and event
 * plumbing (webhook.ts). That way a fork can swap the transport without
 * rewriting the semantic translation — and vice-versa.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemsToDna = itemsToDna;
exports.itemToNoun = itemToNoun;
exports.dnaToItems = dnaToItems;
/** Collapse a flat list of external items into an operational DNA slice. */
function itemsToDna(items, domain) {
    const leaf = domain.split('.').pop() ?? domain;
    const nouns = items.map(itemToNoun);
    return {
        operational: {
            domain: { name: leaf, path: domain, nouns },
        },
    };
}
function itemToNoun(item) {
    return {
        name: toPascalCase(item.title),
        ...(item.description ? { description: item.description } : {}),
        metadata: {
            externalId: item.id,
            ...(item.tags?.length ? { tags: item.tags } : {}),
        },
    };
}
/** Walk every Noun in a DNA document, ignoring nested sub-domains for brevity. */
function dnaToItems(dna) {
    const nouns = dna.operational?.domain.nouns ?? [];
    return nouns.map((n) => ({
        title: n.name,
        ...(n.description ? { description: n.description } : {}),
        ...(n.metadata?.tags?.length ? { tags: n.metadata.tags } : {}),
    }));
}
function toPascalCase(s) {
    return s
        .split(/[^A-Za-z0-9]+/)
        .filter(Boolean)
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join('');
}
//# sourceMappingURL=mapping.js.map