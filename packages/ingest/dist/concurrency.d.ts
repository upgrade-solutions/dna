/**
 * Run `worker(item)` for every item with at most `concurrency` calls in
 * flight. Returns results in the same order as `items`, regardless of
 * completion order.
 *
 * Throws synchronously if `concurrency < 1`.
 */
export declare function runBounded<T, R>(items: T[], concurrency: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]>;
//# sourceMappingURL=concurrency.d.ts.map