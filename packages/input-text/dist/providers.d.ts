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