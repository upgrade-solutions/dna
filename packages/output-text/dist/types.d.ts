/**
 * Loose structural types describing the DNA shapes this renderer reads.
 * Only fields actually consumed are modeled; callers may pass partial DNA.
 */
export interface DnaInput {
    operational?: OperationalDna;
}
export interface OperationalDna {
    domain: OperationalDomain;
    capabilities?: Capability[];
    rules?: Rule[];
    outcomes?: Outcome[];
    causes?: Cause[];
    signals?: Signal[];
    relationships?: Relationship[];
    positions?: Position[];
    tasks?: Task[];
    processes?: Process[];
}
export interface OperationalDomain {
    name: string;
    path?: string;
    description?: string;
    nouns?: Noun[];
    domains?: OperationalDomain[];
}
export interface Noun {
    name: string;
    description?: string;
    attributes?: Attribute[];
    verbs?: Verb[];
}
export interface Attribute {
    name: string;
    type?: string;
    required?: boolean;
    description?: string;
}
export interface Verb {
    name: string;
    description?: string;
}
export interface Capability {
    name: string;
    noun: string;
    verb: string;
    description?: string;
}
export interface Rule {
    name?: string;
    capability: string;
    type?: 'access' | 'condition';
    description?: string;
    allow?: RuleAllow[];
    condition?: string;
}
export interface RuleAllow {
    role?: string;
    ownership?: string;
    flags?: string[];
}
export interface Outcome {
    capability: string;
    description?: string;
    changes?: OutcomeChange[];
    initiate?: string[];
    emits?: string[];
}
export interface OutcomeChange {
    attribute: string;
    set?: unknown;
}
export interface Cause {
    capability: string;
    source: string;
    description?: string;
    signal?: string;
}
export interface Signal {
    name: string;
    capability: string;
    description?: string;
}
export interface Relationship {
    name: string;
    from: string;
    to: string;
    attribute: string;
    cardinality: string;
    description?: string;
}
export interface Position {
    name: string;
    description?: string;
    roles?: string[];
}
export interface Task {
    name: string;
    position: string;
    capability: string;
    description?: string;
}
export interface Process {
    name: string;
    description?: string;
    operator?: string;
    steps?: ProcessStep[];
}
export interface ProcessStep {
    id: string;
    task: string;
    depends_on?: string[];
}
/** Which DNA primitive becomes one text document. */
export type Unit = 'capability' | 'noun' | 'process';
/**
 * Body template applied to a unit's rendered text.
 *
 *   - user-story   As a / I want / So that + acceptance criteria. Fits Capability.
 *   - gherkin      Feature / Scenario / Given / When / Then. Fits Capability.
 *   - product-dna  Key:value blocks using Product-DNA vocabulary
 *                  (Actor, Resource, Action, Role, Field, Operation). Fits all units.
 *
 * Noun and Process always render as `product-dna` regardless of the style
 * requested — user-story/gherkin are action-shaped and don't translate.
 */
export type Style = 'user-story' | 'gherkin' | 'product-dna';
/**
 * Map a DNA primitive to the style used when rendering it.
 * The key set also determines which units are emitted — absent units are skipped.
 */
export type StyleMap = Partial<Record<Unit, Style>>;
export declare const DEFAULT_STYLES: StyleMap;
export interface RenderOptions {
    /** Document title. Defaults to the operational domain's path or name. */
    title?: string;
    /** Unit → style map. Default: `{ capability: 'user-story' }`. */
    styles?: StyleMap;
}
export interface RenderManyOptions {
    /** Unit → style map. Default: `{ capability: 'user-story' }`. */
    styles?: StyleMap;
}
/**
 * A single rendered document — shaped for pushing to an issue tracker,
 * docs platform, or database row. `id` is `{unit}-{slug}` (e.g.
 * `capability-loan-apply`) so multi-unit results can't collide.
 */
export interface TextDocument {
    id: string;
    title: string;
    body: string;
}
//# sourceMappingURL=types.d.ts.map