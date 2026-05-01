/**
 * Shared types for the integration template.
 *
 * A real integration owns three surfaces:
 *   1. Outbound API calls    → `client.ts`
 *   2. Inbound webhooks      → `webhook.ts`
 *   3. CLI entrypoint        → `cli.ts`
 *
 * The external system in this template is a fictional "ExampleCo" issue
 * tracker with `Item` records. Replace everything under `External*` with
 * the shapes your real system exposes.
 */
import { DnaInput } from './dna-types';
export { DnaInput };
export interface ExternalItem {
    id: string;
    title: string;
    description?: string;
    tags?: string[];
    updatedAt?: string;
}
export interface ExternalListResponse {
    items: ExternalItem[];
    nextCursor?: string;
}
export interface ClientOptions {
    /** Base URL of the external API. */
    baseUrl: string;
    /** API token used as a Bearer credential. */
    apiToken: string;
    /** Override user-agent sent with every request. */
    userAgent?: string;
    /** Inject a fetch implementation — mainly for tests. Defaults to global fetch. */
    fetchImpl?: typeof fetch;
}
export interface Client {
    listItems(options?: {
        cursor?: string;
    }): Promise<ExternalListResponse>;
    createItem(item: Omit<ExternalItem, 'id'>): Promise<ExternalItem>;
    /** Fetch every page and collapse into a single DNA document. */
    pullDna(): Promise<DnaInput>;
    /** Push a DNA document to the external system (creates missing Items). */
    pushDna(dna: DnaInput): Promise<{
        created: number;
    }>;
}
export type WebhookEventType = 'item.created' | 'item.updated' | 'item.deleted';
export interface WebhookEvent {
    type: WebhookEventType;
    item: ExternalItem;
    occurredAt: string;
}
export interface WebhookOptions {
    /** Shared secret used to verify the HMAC-SHA256 signature header. */
    secret: string;
    /** Header carrying the signature. Defaults to `x-example-signature`. */
    signatureHeader?: string;
}
//# sourceMappingURL=types.d.ts.map