/**
 * Type definitions for default value handling in envguard schemas.
 */

/** Primitive types supported as default values */
export type DefaultValue = string | number | boolean;

/** A field definition that includes an optional default */
export interface FieldWithDefault {
  default?: DefaultValue;
}

/** Result of applying defaults to an environment record */
export interface DefaultsApplyResult {
  /** The merged environment with defaults applied */
  env: Record<string, string | undefined>;
  /** Keys whose values came from defaults (not from actual environment) */
  appliedKeys: string[];
}

/**
 * Applies defaults to an env record and tracks which keys were defaulted.
 * Useful for logging or debugging which values were not explicitly set.
 */
export function applyDefaultsWithTracking(
  env: Record<string, string | undefined>,
  defaults: Record<string, DefaultValue | undefined>
): DefaultsApplyResult {
  const result: Record<string, string | undefined> = { ...env };
  const appliedKeys: string[] = [];

  for (const [key, value] of Object.entries(defaults)) {
    if ((result[key] === undefined || result[key] === '') && value !== undefined) {
      result[key] = String(value);
      appliedKeys.push(key);
    }
  }

  return { env: result, appliedKeys };
}
