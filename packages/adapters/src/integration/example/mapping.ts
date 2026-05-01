/**
 * Bidirectional mapping between the external system's records and DNA.
 *
 * Keep mapping logic isolated from transport (client.ts) and event
 * plumbing (webhook.ts). That way a fork can swap the transport without
 * rewriting the semantic translation — and vice-versa.
 */

import { DnaInput, Resource } from './dna-types'
import { ExternalItem } from './types'

/** Collapse a flat list of external items into an operational DNA slice. */
export function itemsToDna(items: ExternalItem[], domain: string): DnaInput {
  const leaf = domain.split('.').pop() ?? domain
  const resources: Resource[] = items.map(itemToResource)
  return {
    operational: {
      domain: { name: leaf, path: domain, resources },
    },
  }
}

export function itemToResource(item: ExternalItem): Resource {
  return {
    name: toPascalCase(item.title),
    ...(item.description ? { description: item.description } : {}),
    metadata: {
      externalId: item.id,
      ...(item.tags?.length ? { tags: item.tags } : {}),
    },
  }
}

/** Walk every Resource in a DNA document, ignoring nested sub-domains for brevity. */
export function dnaToItems(dna: DnaInput): Omit<ExternalItem, 'id'>[] {
  const resources = dna.operational?.domain.resources ?? []
  return resources.map((r) => ({
    title: r.name,
    ...(r.description ? { description: r.description } : {}),
    ...(r.metadata?.tags?.length ? { tags: r.metadata.tags } : {}),
  }))
}

function toPascalCase(s: string): string {
  return s
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('')
}
