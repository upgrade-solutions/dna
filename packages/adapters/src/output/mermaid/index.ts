import { DnaInput } from './types'
import { renderErd } from './diagrams/erd'
import { renderFlowchart, FlowchartDirection } from './diagrams/flowchart'

export type Diagram = 'erd' | 'flowchart'

export const DEFAULT_DIAGRAMS: readonly Diagram[] = ['erd', 'flowchart']

export interface RenderOptions {
  /** Which diagrams to emit, in the given order. Defaults to DEFAULT_DIAGRAMS. */
  diagrams?: readonly Diagram[]
  /** Direction for flowchart diagrams. Defaults to 'TD'. */
  flowchartDirection?: FlowchartDirection
}

/**
 * Returns raw Mermaid source. Multiple diagrams are concatenated with blank
 * lines between blocks; no code-fence wrapping (callers can add ``` markers
 * if embedding in markdown).
 */
export function render(dna: DnaInput, options: RenderOptions = {}): string {
  const diagrams = options.diagrams ?? DEFAULT_DIAGRAMS
  const blocks: string[] = []

  for (const diagram of diagrams) {
    const rendered = renderDiagram(diagram, dna, options)
    if (rendered) blocks.push(rendered)
  }

  return blocks.length ? blocks.join('\n\n') + '\n' : ''
}

function renderDiagram(
  diagram: Diagram,
  dna: DnaInput,
  options: RenderOptions,
): string | null {
  switch (diagram) {
    case 'erd':
      return renderErd(dna)
    case 'flowchart':
      return renderFlowchart(dna, options.flowchartDirection)
  }
}

export type { FlowchartDirection } from './diagrams/flowchart'
export * from './types'
