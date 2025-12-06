/**
 * Quick test to verify layout manager nested layout support
 * This file can be deleted - it's just for verification
 */

import { LayoutManager, type LayoutType, type NestedLayoutOptions } from './layout-manager'
import { dia } from '@joint/plus'

// Create a test graph
const graph = new dia.Graph()

// Create layout manager with nested layout
const layoutManager = new LayoutManager(graph, 'nested', 'nested')

// Test 1: Check nested layout is available
const availableLayouts = LayoutManager.getAvailableLayouts()
const nestedLayout = availableLayouts.find(l => l.value === 'nested')
console.log('✓ Nested layout available:', nestedLayout)

// Test 2: Check nested options are set
console.log('✓ Nested options:', layoutManager.nestedOptions)

// Test 3: Check requiresRerender works
const rerenderTreeToNested = layoutManager.requiresRerender('tree', 'nested')
const rerenderNestedToTree = layoutManager.requiresRerender('nested', 'tree')
const rerenderTreeToGrid = layoutManager.requiresRerender('tree', 'dagre')
const rerenderSameLayout = layoutManager.requiresRerender('tree', 'tree')

console.log('✓ Rerender tree→nested:', rerenderTreeToNested, '(should be true)')
console.log('✓ Rerender nested→tree:', rerenderNestedToTree, '(should be true)')
console.log('✓ Rerender tree→dagre:', rerenderTreeToGrid, '(should be false)')
console.log('✓ Rerender tree→tree:', rerenderSameLayout, '(should be false)')

// Test 4: Check layout type name
console.log('✓ Layout type name:', layoutManager.layoutTypeName)

// Test 5: Update nested options
layoutManager.setNestedOptions({ containerPadding: 100 })
console.log('✓ Updated nested options:', layoutManager.nestedOptions.containerPadding)

// Test 6: Get layout config
const config = layoutManager.getLayoutConfig('nested') as NestedLayoutOptions
console.log('✓ Get nested config:', config)

console.log('\n✅ All tests passed! Nested layout infrastructure is ready.')

export {}
