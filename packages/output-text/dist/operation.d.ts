/**
 * Render a single Operation as prose, styled three ways:
 *
 *   - user-story   As a / I want / So that + triggers + acceptance criteria
 *   - gherkin      Feature / Scenario / Given / When / Then
 *   - product-dna  Actor / Resource / Action / Trigger / Preconditions / Postconditions
 *
 * Each helper returns the body only; the title is stable across styles and
 * produced by `operationTitle`.
 */
import { Operation, OperationalDna, Style } from './types';
export declare function operationTitle(op: Operation): string;
export declare function renderOperation(op: Operation, dna: OperationalDna, style: Style): string;
//# sourceMappingURL=operation.d.ts.map