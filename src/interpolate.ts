/**
 * Interpolates environment variable references within string values.
 * Supports ${VAR_NAME} and $VAR_NAME syntax.
 */

export type InterpolationContext = Record<string, string | undefined>;

export class InterpolationError extends Error {
  constructor(
    public readonly variable: string,
    public readonly referencedVar: string
  ) {
    super(
      `Variable "${variable}" references undefined variable "${referencedVar}"`
    );
    this.name = "InterpolationError";
  }
}

/**
 * Resolves ${VAR} or $VAR references in a string using the provided context.
 * Throws InterpolationError if a referenced variable is not defined.
 */
export function interpolate(
  key: string,
  value: string,
  context: InterpolationContext
): string {
  const bracketPattern = /\$\{([A-Z_][A-Z0-9_]*)\}/g;
  const barePattern = /\$([A-Z_][A-Z0-9_]*)/g;

  let result = value.replace(bracketPattern, (_, ref: string) => {
    if (!(ref in context) || context[ref] === undefined) {
      throw new InterpolationError(key, ref);
    }
    return context[ref] as string;
  });

  result = result.replace(barePattern, (_, ref: string) => {
    if (!(ref in context) || context[ref] === undefined) {
      throw new InterpolationError(key, ref);
    }
    return context[ref] as string;
  });

  return result;
}

/**
 * Applies interpolation to all string values in an env map.
 * Non-string values are passed through unchanged.
 */
export function interpolateAll(
  env: Record<string, unknown>,
  context: InterpolationContext = env as InterpolationContext
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(env)) {
    if (typeof value === "string") {
      result[key] = interpolate(key, value, context);
    } else {
      result[key] = value;
    }
  }

  return result;
}
