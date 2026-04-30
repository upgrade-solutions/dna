/**
 * Run `worker(item)` for every item with at most `concurrency` calls in
 * flight. Returns results in the same order as `items`, regardless of
 * completion order.
 *
 * Throws synchronously if `concurrency < 1`.
 */
export async function runBounded<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (!Number.isFinite(concurrency) || concurrency < 1) {
    throw new Error(`dna-ingest: concurrency must be >= 1 (got ${concurrency})`)
  }
  const results: R[] = new Array(items.length)
  let cursor = 0

  async function next(): Promise<void> {
    while (true) {
      const i = cursor++
      if (i >= items.length) return
      results[i] = await worker(items[i], i)
    }
  }

  const lanes = Array.from({ length: Math.min(concurrency, items.length) }, () => next())
  await Promise.all(lanes)
  return results
}
