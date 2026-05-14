import { applyRule, sanitizeValue, sanitizeEnv, formatSanitizeReport } from './sanitize';
import type { SanitizeRule } from './sanitize.types';

describe('applyRule', () => {
  it('trims whitespace', () => {
    expect(applyRule('  hello  ', { type: 'trim' })).toBe('hello');
  });

  it('lowercases value', () => {
    expect(applyRule('HELLO', { type: 'lowercase' })).toBe('hello');
  });

  it('uppercases value', () => {
    expect(applyRule('hello', { type: 'uppercase' })).toBe('HELLO');
  });

  it('replaces pattern', () => {
    expect(applyRule('foo-bar', { type: 'replace', pattern: '-', replacement: '_' })).toBe('foo_bar');
  });

  it('truncates value', () => {
    expect(applyRule('abcdef', { type: 'truncate', maxLength: 3 })).toBe('abc');
  });
});

describe('sanitizeValue', () => {
  it('applies multiple rules in order', () => {
    const rules: SanitizeRule[] = [
      { type: 'trim' },
      { type: 'lowercase' },
    ];
    expect(sanitizeValue('  HELLO  ', rules)).toBe('hello');
  });

  it('returns value unchanged when no rules', () => {
    expect(sanitizeValue('hello', [])).toBe('hello');
  });
});

describe('sanitizeEnv', () => {
  const env = { APP_NAME: '  MyApp  ', NODE_ENV: 'PRODUCTION', SECRET: 'abc123' };
  const rules: SanitizeRule[] = [{ type: 'trim' }, { type: 'lowercase' }];

  it('sanitizes all values', () => {
    const result = sanitizeEnv(env, { rules });
    expect(result.sanitized['APP_NAME']).toBe('myapp');
    expect(result.sanitized['NODE_ENV']).toBe('production');
  });

  it('tracks changed keys', () => {
    const result = sanitizeEnv(env, { rules });
    expect(result.changed).toContain('APP_NAME');
    expect(result.changed).toContain('NODE_ENV');
  });

  it('preserves original values', () => {
    const result = sanitizeEnv(env, { rules });
    expect(result.original['APP_NAME']).toBe('  MyApp  ');
  });

  it('skips specified keys', () => {
    const result = sanitizeEnv(env, { rules, skip: ['SECRET'] });
    expect(result.sanitized['SECRET']).toBe('abc123');
    expect(result.changed).not.toContain('SECRET');
  });
});

describe('formatSanitizeReport', () => {
  it('returns no-change message when nothing changed', () => {
    const result = { original: { A: 'x' }, sanitized: { A: 'x' }, changed: [] };
    expect(formatSanitizeReport(result)).toBe('sanitize: no changes applied');
  });

  it('lists changed keys with before/after values', () => {
    const result = {
      original: { KEY: '  hello  ' },
      sanitized: { KEY: 'hello' },
      changed: ['KEY'],
    };
    const report = formatSanitizeReport(result);
    expect(report).toContain('1 value(s) changed');
    expect(report).toContain('KEY');
    expect(report).toContain('"  hello  "');
    expect(report).toContain('"hello"');
  });
});
