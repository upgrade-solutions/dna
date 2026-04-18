import { render } from './index'
import { DnaInput } from './types'

const dna: DnaInput = {
  operational: {
    domain: {
      name: 'lending',
      path: 'acme.finance.lending',
      description: 'The lending desk.',
      nouns: [
        {
          name: 'Loan',
          attributes: [
            { name: 'amount', type: 'number', required: true },
            { name: 'status', type: 'string' },
          ],
          verbs: [{ name: 'Apply' }, { name: 'Approve' }],
        },
      ],
    },
    capabilities: [
      { noun: 'Loan', verb: 'Apply', name: 'Loan.Apply' },
      { noun: 'Loan', verb: 'Approve', name: 'Loan.Approve' },
    ],
  },
}

describe('@dna-codes/output-example — render', () => {
  it('uses the domain path as the default title', () => {
    const out = render(dna)
    expect(out.split('\n')[0]).toBe('# acme.finance.lending')
  })

  it('renders the description paragraph after the title', () => {
    expect(render(dna)).toContain('The lending desk.')
  })

  it('emits summary counts', () => {
    const out = render(dna)
    expect(out).toContain('- Nouns: 1')
    expect(out).toContain('- Capabilities: 2')
  })

  it('emits the domain-model outline', () => {
    const out = render(dna)
    expect(out).toContain('- Loan')
    expect(out).toContain('  - amount: number (required)')
    expect(out).toContain('  - verb: Apply')
  })

  it('honors custom sections and ordering', () => {
    const out = render(dna, { sections: ['domain-model'] })
    expect(out).not.toContain('## Summary')
    expect(out).toContain('## Domain model')
  })

  it('returns empty string when DNA is empty', () => {
    expect(render({})).toBe('')
  })

  it('honors title override', () => {
    expect(render(dna, { title: 'Custom' })).toMatch(/^# Custom\n/)
  })

  it('honors headingLevel', () => {
    const out = render(dna, { headingLevel: 2 })
    expect(out.split('\n')[0]).toBe('## acme.finance.lending')
    expect(out).toContain('### Summary')
  })
})
