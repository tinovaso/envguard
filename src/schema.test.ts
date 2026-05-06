import { defineSchema, extractMetadata, getSensitiveKeys, describeField } from './schema';

describe('defineSchema', () => {
  it('returns schema unchanged when valid', () => {
    const schema = defineSchema({
      PORT: { type: 'number', description: 'Server port', example: '3000' },
      DEBUG: { type: 'boolean', default: false },
    });
    expect(schema.PORT.type).toBe('number');
    expect(schema.DEBUG.default).toBe(false);
  });

  it('throws if allowedValues is an empty array', () => {
    expect(() =>
      defineSchema({ NODE_ENV: { type: 'string', allowedValues: [] } })
    ).toThrow(/allowedValues must not be empty/);
  });

  it('throws if a field is both required and has a default', () => {
    expect(() =>
      defineSchema({ HOST: { type: 'string', required: true, default: 'localhost' } })
    ).toThrow(/cannot be both required and have a default/);
  });
});

describe('extractMetadata', () => {
  it('returns one metadata entry per key', () => {
    const schema = defineSchema({
      API_KEY: { type: 'string', sensitive: true },
      TIMEOUT: { type: 'number', default: 5000 },
    });
    const meta = extractMetadata(schema);
    expect(meta).toHaveLength(2);
    expect(meta[0].key).toBe('API_KEY');
    expect(meta[1].definition.default).toBe(5000);
  });
});

describe('getSensitiveKeys', () => {
  it('returns only sensitive keys', () => {
    const schema = defineSchema({
      API_KEY: { type: 'string', sensitive: true },
      PORT: { type: 'number' },
      DB_PASS: { type: 'string', sensitive: true },
    });
    expect(getSensitiveKeys(schema)).toEqual(['API_KEY', 'DB_PASS']);
  });

  it('returns empty array when no sensitive keys', () => {
    const schema = defineSchema({ PORT: { type: 'number' } });
    expect(getSensitiveKeys(schema)).toEqual([]);
  });
});

describe('describeField', () => {
  it('includes type and required marker for required fields', () => {
    const result = describeField('PORT', { type: 'number', description: 'The port' });
    expect(result).toContain('PORT (number)');
    expect(result).toContain('[required]');
    expect(result).toContain('The port');
  });

  it('includes default value when provided', () => {
    const result = describeField('DEBUG', { type: 'boolean', default: false });
    expect(result).toContain('[default: false]');
    expect(result).not.toContain('[required]');
  });

  it('includes sensitive marker', () => {
    const result = describeField('API_KEY', { type: 'string', sensitive: true });
    expect(result).toContain('[sensitive]');
  });

  it('includes example when provided', () => {
    const result = describeField('HOST', { type: 'string', example: 'localhost' });
    expect(result).toContain('e.g. "localhost"');
  });
});
