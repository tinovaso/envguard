import { describe, it, expect } from 'vitest';
import { validate } from './validate';
import { EnvSchema } from './index';

describe('validate', () => {
  it('returns valid report when all required vars are present', () => {
    const schema: EnvSchema = {
      PORT: { type: 'number', required: true, description: 'App port' },
      NODE_ENV: { type: 'string', required: true },
    };
    const env = { PORT: '3000', NODE_ENV: 'production' };
    const report = validate(schema, env);
    expect(report.valid).toBe(true);
    expect(report.errors).toHaveLength(0);
    expect(report.fields).toHaveLength(2);
    expect(report.fields[0].status).toBe('valid');
  });

  it('reports missing required variables', () => {
    const schema: EnvSchema = {
      DATABASE_URL: { type: 'string', required: true },
    };
    const report = validate(schema, {});
    expect(report.valid).toBe(false);
    expect(report.errors[0]).toContain('DATABASE_URL is required');
    expect(report.fields[0].status).toBe('missing');
  });

  it('uses default values when var is not set', () => {
    const schema: EnvSchema = {
      LOG_LEVEL: { type: 'string', default: 'info' },
    };
    const report = validate(schema, {});
    expect(report.valid).toBe(true);
    expect(report.fields[0].status).toBe('default');
    expect(report.fields[0].defaultValue).toBe('info');
  });

  it('reports invalid when custom validator fails', () => {
    const schema: EnvSchema = {
      PORT: {
        type: 'number',
        required: true,
        validator: (v) => (Number(v) > 0 && Number(v) < 65536) || 'PORT must be between 1 and 65535',
      },
    };
    const report = validate(schema, { PORT: '99999' });
    expect(report.valid).toBe(false);
    expect(report.errors[0]).toContain('PORT must be between 1 and 65535');
    expect(report.fields[0].status).toBe('invalid');
  });

  it('passes when optional var is missing', () => {
    const schema: EnvSchema = {
      OPTIONAL_FEATURE: { type: 'string', required: false },
    };
    const report = validate(schema, {});
    expect(report.valid).toBe(true);
  });
});
