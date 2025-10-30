// Formula handler for evaluating expressions

import { ExecutionContext, HandlerConfig } from "../types.ts";

interface FormulaConfig extends HandlerConfig {
  expression: string; // Simple expression to evaluate
  variables?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Evaluates simple expressions/formulas
 * Supports basic operations: +, -, *, /, comparisons, etc.
 */
export async function handleFormula(
  ctx: ExecutionContext,
  config: FormulaConfig
): Promise<unknown> {
  const { expression, variables = {} } = config;

  try {
    const result = evaluateExpression(expression, {
      ...variables,
      body: ctx.body,
      params: ctx.params,
    });

    return {
      success: true,
      expression,
      result,
    };
  } catch (error) {
    throw new Error(
      `Formula evaluation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Simple expression evaluator
 * WARNING: This is a simplified implementation. For production,
 * use a proper expression engine like expr or mathjs
 */
function evaluateExpression(
  expression: string,
  context: Record<string, unknown>
): unknown {
  // Replace variables in the expression
  let expr = expression;

  for (const [key, value] of Object.entries(context)) {
    const pattern = new RegExp(`\\b${key}\\b`, "g");
    const valueStr = typeof value === "string" ? `"${value}"` : JSON.stringify(value);
    expr = expr.replace(pattern, valueStr);
  }

  // Create a safe evaluation function
  // eslint-disable-next-line no-new-func
  const evaluator = new Function(`return ${expr}`);
  return evaluator();
}
