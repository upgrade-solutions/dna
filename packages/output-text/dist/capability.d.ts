/**
 * Render a single Capability as prose, styled three ways:
 *
 *   - user-story   As a / I want / So that + triggers + acceptance criteria
 *   - gherkin      Feature / Scenario / Given / When / Then
 *   - product-dna  Actor / Resource / Action / Trigger / Preconditions / Postconditions
 *
 * Each helper returns the body only; the title is stable across styles and
 * produced by `capabilityTitle`.
 */
import { Capability, OperationalDna, Style } from './types';
export declare function capabilityTitle(cap: Capability): string;
export declare function renderCapability(cap: Capability, op: OperationalDna, style: Style): string;
//# sourceMappingURL=capability.d.ts.map