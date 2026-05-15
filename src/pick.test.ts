import { describe, it, expect } from 'vitest';
import { pickEnv, pickSchema, omitEnv, omitSchema } from './pick';

const sampleEnv = {
  HOST: 'localhost',
  PORT: '3000',
  DB_URL: 'postgres://localhost/db',
  SECRET: 'supersecret',
};

const sampleSchema = {
  HOST: { type: 'string' as const, description: 'Hostname' },
  PORT: { type: 'number' as const, description: 'Port' },
  DB_URL: { type: 'string' as const, description: 'Database URL' },
  SECRET: { type: 'string' as const, sensitive: true },
};

describe('pickEnv', () => {
  it('returns only the specified keys', () => {
    const result = pickEnv(sampleEnv, ['HOST', 'PORT']);
    expect(result).toEqual({ HOST: 'localhost', PORT: '3000' });
  });

  it('ignores keys not present in the env', () => {
    const result = pickEnv(sampleEnv, ['HOST', 'MISSING' as keyof typeof sampleEnv]);
    expect(result).toEqual({ HOST: 'localhost' });
  });

  it('returns empty object when no keys match', () => {
    const result = pickEnv(sampleEnv, []);
    expect(result).toEqual({});
  });
});

describe('pickSchema', () => {
  it('returns only the specified schema fields', () => {
    const result = pickSchema(sampleSchema, ['HOST', 'PORT']);
    expect(Object.keys(result)).toEqual(['HOST', 'PORT']);
    expect(result.HOST).toEqual(sampleSchema.HOST);
  });

  it('returns empty schema for empty keys array', () => {
    const result = pickSchema(sampleSchema, []);
    expect(Object.keys(result)).toHaveLength(0);
  });
});

describe('omitEnv', () => {
  it('excludes the specified keys', () => {
    const result = omitEnv(sampleEnv, ['SECRET', 'DB_URL']);
    expect(result).toEqual({ HOST: 'localhost', PORT: '3000' });
  });

  it('returns full env when no keys are omitted', () => {
    const result = omitEnv(sampleEnv, []);
    expect(result).toEqual(sampleEnv);
  });

  it('handles omitting a key not present in env gracefully', () => {
    const result = omitEnv(sampleEnv, ['MISSING' as keyof typeof sampleEnv]);
    expect(result).toEqual(sampleEnv);
  });
});

describe('omitSchema', () => {
  it('excludes the specified schema fields', () => {
    const result = omitSchema(sampleSchema, ['SECRET']);
    expect(Object.keys(result)).not.toContain('SECRET');
    expect(Object.keys(result)).toContain('HOST');
  });

  it('returns full schema when no keys are omitted', () => {
    const result = omitSchema(sampleSchema, []);
    expect(Object.keys(result)).toHaveLength(Object.keys(sampleSchema).length);
  });
});
