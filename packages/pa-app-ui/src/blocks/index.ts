import React from 'react'
import { Button } from '@/ui/Button'
import { Panel } from '@/ui/Panel'
import { GraphCanvas } from './diagram/GraphCanvas'
import { Heading } from './text/Heading'
import { Paragraph } from './text/Paragraph'

// Block type registry - maps string identifiers to React components
export const BlockRegistry = new Map<string, React.ComponentType<any>>([
  // UI components
  ['button', Button],
  ['panel', Panel],
  
  // Text blocks
  ['heading', Heading],
  ['paragraph', Paragraph],
  
  // Diagram blocks
  ['graph-canvas', GraphCanvas],
])

export default BlockRegistry
