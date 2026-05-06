import { EnvSchema } from './index';
import { FieldReport, ValidationReport } from './reporter';

export function validate(
  schema: EnvSchema,
  env: Record<string, string | undefined> = process.env
): ValidationReport {
  const fields: FieldReport[] = [];
  const errors: string[] = [];

  for (const [key, def] of Object.entries(schema)) {
    const raw = env[key];
    const hasValue = raw !== undefined && raw !== '';
    const required = def.required !== false && def.default === undefined;

    if (!hasValue && required) {
      errors.push(`${key} is required but not set`);
      fields.push({
        key,
        status: 'missing',
        required: true,
        description: def.description,
      });
      continue;
    }

    if (!hasValue && def.default !== undefined) {
      fields.push({
        key,
        status: 'default',
        defaultValue: String(def.default),
        required: false,
        description: def.description,
      });
      continue;
    }

    if (def.validator && raw !== undefined) {
      const result = def.validator(raw);
      if (result !== true) {
        const msg = typeof result === 'string' ? result : `${key} failed validation`;
        errors.push(msg);
        fields.push({
          key,
          status: 'invalid',
          value: raw,
          required,
          description: def.description,
        });
        continue;
      }
    }

    fields.push({
      key,
      status: 'valid',
      value: raw,
      required,
      description: def.description,
    });
  }

  return {
    valid: errors.length === 0,
    fields,
    errors,
  };
}
