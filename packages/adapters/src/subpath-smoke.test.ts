/**
 * Confirms each documented subpath resolves to a module with the expected
 * top-level export. Catches drift between the `exports` map, the actual
 * folder layout, and the per-adapter index's named exports.
 */

import * as path from 'path'

const DIST_ROOT = path.resolve(__dirname, '..', 'dist')

interface SubpathCheck {
  subpath: string
  modulePath: string
  expectedExport: string
}

const CHECKS: SubpathCheck[] = [
  { subpath: 'input/json', modulePath: 'input/json/index.js', expectedExport: 'parse' },
  { subpath: 'input/openapi', modulePath: 'input/openapi/index.js', expectedExport: 'parse' },
  { subpath: 'input/text', modulePath: 'input/text/index.js', expectedExport: 'parse' },
  { subpath: 'input/example', modulePath: 'input/example/index.js', expectedExport: 'parse' },
  { subpath: 'output/markdown', modulePath: 'output/markdown/index.js', expectedExport: 'render' },
  { subpath: 'output/html', modulePath: 'output/html/index.js', expectedExport: 'render' },
  { subpath: 'output/mermaid', modulePath: 'output/mermaid/index.js', expectedExport: 'render' },
  { subpath: 'output/openapi', modulePath: 'output/openapi/index.js', expectedExport: 'render' },
  { subpath: 'output/text', modulePath: 'output/text/index.js', expectedExport: 'render' },
  { subpath: 'output/example', modulePath: 'output/example/index.js', expectedExport: 'render' },
  { subpath: 'integration/jira', modulePath: 'integration/jira/index.js', expectedExport: 'createClient' },
  { subpath: 'integration/google-drive', modulePath: 'integration/google-drive/index.js', expectedExport: 'googleDriveIntegration' },
  { subpath: 'integration/example', modulePath: 'integration/example/index.js', expectedExport: 'createClient' },
]

describe('subpath imports', () => {
  for (const c of CHECKS) {
    it(`@dna-codes/dna-adapters/${c.subpath} → ${c.expectedExport}`, () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(path.join(DIST_ROOT, c.modulePath))
      expect(mod).toBeDefined()
      expect(mod[c.expectedExport]).toBeDefined()
    })
  }
})
