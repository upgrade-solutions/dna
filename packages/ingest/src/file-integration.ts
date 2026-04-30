import * as fs from 'fs'
import * as path from 'path'
import * as url from 'url'
import type { FetchResult, Integration } from './types'

const EXT_TO_MIME: Record<string, string> = {
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.markdown': 'text/markdown',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.json': 'application/json',
  '.yaml': 'application/yaml',
  '.yml': 'application/yaml',
  '.xml': 'application/xml',
  '.csv': 'text/csv',
  '.tsv': 'text/tab-separated-values',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
}

const TEXT_MIMES = new Set([
  'text/plain',
  'text/markdown',
  'text/html',
  'text/csv',
  'text/tab-separated-values',
  'application/json',
  'application/yaml',
  'application/xml',
])

/**
 * Built-in fetcher for `file://` URIs and bare filesystem paths. Used
 * internally by the orchestrator and exported so callers can test
 * integration-shaped flows without reaching for private internals.
 */
export function fileIntegration(): Integration {
  return {
    async fetch(uri: string): Promise<FetchResult> {
      const filePath = resolveFilePath(uri)
      const ext = path.extname(filePath).toLowerCase()
      const mimeType = EXT_TO_MIME[ext] ?? 'application/octet-stream'
      const contents = TEXT_MIMES.has(mimeType)
        ? fs.readFileSync(filePath, 'utf-8')
        : fs.readFileSync(filePath)
      return {
        contents,
        mimeType,
        source: {
          uri,
          loadedAt: new Date().toISOString(),
        },
      }
    },
  }
}

/**
 * Convert a `file://` URI or bare path to an absolute filesystem path.
 * Exported for test reuse.
 */
export function resolveFilePath(uri: string): string {
  if (uri.startsWith('file://')) return url.fileURLToPath(uri)
  return path.resolve(uri)
}
