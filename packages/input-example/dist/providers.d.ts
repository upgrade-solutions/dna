/**
 * LLM provider dispatch for the probabilistic mode.
 *
 * Kept as a small, fetch-only abstraction so the package has zero runtime
 * dependencies. Add or remove providers by extending the `Provider` union
 * in `types.ts` and updating the two maps + the `dispatch` switch below.
 *
 * Delete this file entirely if your fork is deterministic-only.
 */
import { Provider } from './types';
export interface DispatchArgs {
    provider: Provider;
    apiKey: string;
    baseUrl?: string;
    model: string;
    system: string;
    user: string;
    temperature: number;
    fetchImpl: typeof fetch;
}
export declare function defaultModel(provider: Provider): string;
export declare function dispatch(args: DispatchArgs): Promise<string>;
//# sourceMappingURL=providers.d.ts.map