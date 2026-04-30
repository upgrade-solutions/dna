import { runBounded } from './concurrency'

describe('runBounded', () => {
  it('processes every item and returns results in input order', async () => {
    const results = await runBounded([1, 2, 3, 4], 2, async (n) => n * 10)
    expect(results).toEqual([10, 20, 30, 40])
  })

  it('respects the concurrency cap', async () => {
    let inFlight = 0
    let peak = 0
    const work = async (_: number) => {
      inFlight++
      peak = Math.max(peak, inFlight)
      await new Promise((r) => setTimeout(r, 10))
      inFlight--
      return null
    }
    await runBounded(Array.from({ length: 10 }, (_, i) => i), 4, work)
    expect(peak).toBeLessThanOrEqual(4)
    expect(peak).toBeGreaterThan(1)
  })

  it('runs serially when concurrency = 1', async () => {
    const order: number[] = []
    const work = async (n: number) => {
      order.push(n)
      await new Promise((r) => setTimeout(r, 5))
      order.push(-n)
      return n
    }
    await runBounded([1, 2, 3], 1, work)
    expect(order).toEqual([1, -1, 2, -2, 3, -3])
  })

  it('rejects concurrency < 1 synchronously', async () => {
    await expect(runBounded([1], 0, async () => null)).rejects.toThrow(/concurrency must be >= 1/)
    await expect(runBounded([1], -3, async () => null)).rejects.toThrow(/concurrency must be >= 1/)
  })

  it('handles an empty input array', async () => {
    const results = await runBounded<number, number>([], 4, async () => 0)
    expect(results).toEqual([])
  })
})
