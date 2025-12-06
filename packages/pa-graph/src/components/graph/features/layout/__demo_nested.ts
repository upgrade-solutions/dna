/**
 * Demo: Building a Nested Graph from Account Resources
 * 
 * This demonstrates Phase 2 implementation:
 * - ContainerNode with hierarchy levels and styling
 * - ContainerFactory for building nested graphs
 * - Nested layout algorithm for positioning
 */

import { dia } from '@joint/plus'
import { ContainerFactory } from './container-factory'
import { applyNestedLayout } from './nested-layout-algorithm'
import type { NestedLayoutOptions } from './layout-manager'
import type { Resource } from '../../../../data/example-resources'
import { inAudioConfig } from '../../../../data/accounts/inaudio/config'

// Example: Small resource hierarchy for testing
const testResources: Resource[] = [
  {
    id: 'account-1',
    type: 'account',
    name: 'Test Account',
    description: 'Example account for nested layout',
    metadata: { resourceType: 'account' },
    children: [
      {
        id: 'app-1',
        type: 'web-application',
        name: 'Dashboard App',
        description: 'Main application',
        metadata: { resourceType: 'web-application' },
        children: [
          {
            id: 'module-1',
            type: 'module',
            name: 'User Module',
            metadata: { resourceType: 'module' },
            children: [
              {
                id: 'page-1',
                type: 'page',
                name: 'Profile Page',
                metadata: { resourceType: 'page' },
                children: [
                  {
                    id: 'section-1',
                    type: 'section',
                    name: 'Header Section',
                    metadata: { resourceType: 'section' },
                    children: [
                      {
                        id: 'block-1',
                        type: 'block',
                        name: 'Avatar Block',
                        metadata: { resourceType: 'ui-component' }
                      },
                      {
                        id: 'block-2',
                        type: 'block',
                        name: 'Name Block',
                        metadata: { resourceType: 'ui-component' }
                      }
                    ]
                  },
                  {
                    id: 'section-2',
                    type: 'section',
                    name: 'Content Section',
                    metadata: { resourceType: 'section' },
                    children: [
                      {
                        id: 'block-3',
                        type: 'block',
                        name: 'Bio Block',
                        metadata: { resourceType: 'ui-component' }
                      }
                    ]
                  }
                ]
              },
              {
                id: 'page-2',
                type: 'page',
                name: 'Settings Page',
                metadata: { resourceType: 'page' },
                children: [
                  {
                    id: 'section-3',
                    type: 'section',
                    name: 'Preferences',
                    metadata: { resourceType: 'section' },
                    children: [
                      {
                        id: 'block-4',
                        type: 'block',
                        name: 'Theme Selector',
                        metadata: { resourceType: 'ui-component' }
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            id: 'module-2',
            type: 'module',
            name: 'Auth Module',
            metadata: { resourceType: 'module' },
            children: [
              {
                id: 'page-3',
                type: 'page',
                name: 'Login Page',
                metadata: { resourceType: 'page' },
                children: [
                  {
                    id: 'section-4',
                    type: 'section',
                    name: 'Login Form',
                    metadata: { resourceType: 'section' },
                    children: [
                      {
                        id: 'block-5',
                        type: 'block',
                        name: 'Email Input',
                        metadata: { resourceType: 'ui-component' }
                      },
                      {
                        id: 'block-6',
                        type: 'block',
                        name: 'Password Input',
                        metadata: { resourceType: 'ui-component' }
                      },
                      {
                        id: 'block-7',
                        type: 'block',
                        name: 'Submit Button',
                        metadata: { resourceType: 'ui-component' }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
]

/**
 * Demo function: Build and layout nested graph
 */
export function demoNestedLayout(): void {
  console.log('🎯 Starting Nested Layout Demo')

  // 1. Create graph
  const graph = new dia.Graph()
  console.log('✓ Created graph')

  // 2. Create container factory
  const factory = new ContainerFactory({
    tenantConfig: inAudioConfig,
    layoutOptions: {
      containerPadding: 60,
      levelSpacing: 50,
      siblingSpacing: 40,
      autoResize: true,
      collapsible: false,
      minContainerSize: { width: 300, height: 200 }
    }
  })
  console.log('✓ Created container factory')

  // 3. Build nested graph from resources
  const cells = factory.buildNestedGraph(testResources)
  console.log(`✓ Built nested graph with ${cells.length} cells`)

  // 4. Add cells to graph
  graph.addCells(cells)
  console.log('✓ Added cells to graph')

  // 5. Apply nested layout
  const layoutOptions: Required<NestedLayoutOptions> = {
    containerPadding: 60,
    levelSpacing: 50,
    siblingSpacing: 40,
    autoResize: true,
    collapsible: false,
    minContainerSize: { width: 300, height: 200 }
  }
  applyNestedLayout(graph, layoutOptions)
  console.log('✓ Applied nested layout')

  // 6. Verify structure
  const elements = graph.getElements()
  console.log('\n📊 Graph Structure:')
  console.log(`  Total elements: ${elements.length}`)
  
  const containers = elements.filter(el => el.get('isContainer'))
  console.log(`  Containers: ${containers.length}`)
  
  const leafNodes = elements.filter(el => !el.get('isContainer'))
  console.log(`  Leaf nodes: ${leafNodes.length}`)

  // Show hierarchy breakdown
  const levelCounts: Record<number, number> = {}
  elements.forEach(el => {
    const level = el.get('hierarchyLevel') || 0
    levelCounts[level] = (levelCounts[level] || 0) + 1
  })
  
  console.log('\n📐 Hierarchy Breakdown:')
  Object.entries(levelCounts)
    .sort(([a], [b]) => Number(a) - Number(b))
    .forEach(([level, count]) => {
      const labels = ['Account', 'Application', 'Module', 'Page', 'Section', 'Block']
      console.log(`  L${level} (${labels[Number(level)]}): ${count} nodes`)
    })

  // Show embedding relationships
  console.log('\n🔗 Embedding Relationships:')
  containers.forEach(container => {
    const embeddedCells = container.getEmbeddedCells()
    const name = container.attr('label/text')
    const level = container.get('hierarchyLevel')
    console.log(`  L${level} "${name}" contains ${embeddedCells.length} children`)
  })

  // Show positions
  console.log('\n📍 Root Element Positions:')
  const rootElements = elements.filter(el => !el.get('parentId'))
  rootElements.forEach(el => {
    const pos = el.position()
    const size = el.size()
    const name = el.attr('label/text')
    console.log(`  "${name}": pos(${pos.x}, ${pos.y}) size(${size.width}x${size.height})`)
  })

  console.log('\n✅ Nested Layout Demo Complete!')
  console.log('Graph ready for rendering in JointJS Paper')

  return graph
}

// Run demo if executed directly
if (require.main === module) {
  demoNestedLayout()
}

export { testResources }
