import { EnvSchema } from './index';
import { validate } from './validate';
import { coerceValue } from './coerce';
import { applyDefaults } from './defaults';
import { interpolateAll } from './interpolate';
import { formatReport } from './reporter';
import { extractMetadata, getSensitiveKeys } from './schema';
import { SchemaShape } from './schema.types';

export interface EnvOptions {
  source?: Record<string, string | undefined>;
  strict?: boolean;
  silent?: boolean;
  onError?: (errors: string[]) => void;
}

export interface EnvResult<T> {
  env: T;
  report: string;
  errors: string[];
  valid: boolean;
}

export function loadEnv<S extends SchemaShape>(
  schema: EnvSchema<S>,
  options: EnvOptions = {}
): EnvResult<{ [K in keyof S]: unknown }> {
  const source = options.source ?? process.env;
  const strict = options.strict ?? true;
  const silent = options.silent ?? false;

  // Step 1: Apply defaults
  const withDefaults = applyDefaults(schema, source as Record<string, string>);

  // Step 2: Interpolate variable references
  const interpolated = interpolateAll(withDefaults);

  // Step 3: Validate required fields and constraints
  const { errors } = validate(schema, interpolated);

  // Step 4: Coerce values to declared types
  const coerced: Record<string, unknown> = {};
  const metadata = extractMetadata(schema);

  for (const key of Object.keys(schema)) {
    const raw = interpolated[key];
    const field = metadata[key];
    if (raw !== undefined && field?.type) {
      coerced[key] = coerceValue(raw, field.type);
    } else {
      coerced[key] = raw;
    }
  }

  // Step 5: Generate report
  const sensitiveKeys = getSensitiveKeys(schema);
  const report = formatReport(coerced, sensitiveKeys, errors);

  if (!silent) {
    console.log(report);
  }

  if (errors.length > 0) {
    if (options.onError) {
      options.onError(errors);
    } else if (strict) {
      throw new Error(`envguard: Environment validation failed:\n${errors.join('\n')}`);
    }
  }

  return {
    env: coerced as { [K in keyof S]: unknown },
    report,
    errors,
    valid: errors.length === 0,
  };
}
