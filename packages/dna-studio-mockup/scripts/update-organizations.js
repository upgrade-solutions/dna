#!/usr/bin/env node

/**
 * Auto-generate organization exports
 * Run this script whenever you add new organization JSON files
 * Usage: node scripts/update-organizations.js
 */

const fs = require('fs')
const path = require('path')

const organizationsDir = path.join(__dirname, '../app/api/data/organizations')
const indexPath = path.join(organizationsDir, 'index.ts')

// Get all JSON files in the organizations directory
const jsonFiles = fs.readdirSync(organizationsDir)
  .filter(file => file.endsWith('.json'))
  .sort()

// Generate camelCase names for exports
const toCamelCase = (str) => {
  return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase()) + 'Data'
}

// Generate the index.ts content
const generateIndexContent = () => {
  const exports = jsonFiles.map(file => {
    const name = file.replace('.json', '')
    const camelName = toCamelCase(name)
    return `export { default as ${camelName} } from './${file}'`
  }).join('\n')

  const dynamicImports = jsonFiles.map(file => {
    const name = file.replace('.json', '')
    return `  '${name}': () => import('./${file}')`
  }).join(',\n')

  const allImports = jsonFiles.map(file => {
    return `    import('./${file}')`
  }).join(',\n')

  return `// Auto-generated organization exports
// This file exports all organization data for easy importing
// Generated on: ${new Date().toISOString()}

${exports}

// Organization data mapping
export const organizationFiles = {
${dynamicImports}
}

// Get all organization data as an array
export const getAllOrganizations = async () => {
  const organizations = await Promise.all([
${allImports}
  ])
  
  return organizations.map((org, index) => ({
    key: \`org\${index + 1}\`,
    data: org.default
  }))
}`
}

// Write the generated content
fs.writeFileSync(indexPath, generateIndexContent())

console.log(`✅ Generated organization index with ${jsonFiles.length} organizations:`)
jsonFiles.forEach(file => console.log(`   - ${file}`))
console.log(`📝 Updated: ${indexPath}`)