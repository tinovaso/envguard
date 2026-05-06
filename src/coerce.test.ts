import { describe, it, expect } from 'vitest';
import { coerceValue, CoercionError } from './coerce';

describe('coerceValue', () => {
  describe('string', () => {
    it('returns value as-is', () => {
      expect(coerceValue('KEY', 'hello', 'string')).toBe('hello');
    });
  });

  describe('number', () => {
    it('coerces valid numeric string', () => {
      expect(coerceValue('PORT', '3000', 'number')).toBe(3000);
    });

    it('coerces float string', () => {
      expect(coerceValue('RATIO', '0.75', 'number')).toBe(0.75);
    });

    it('throws CoercionError for non-numeric string', () => {
      expect(() => coerceValue('PORT', 'abc', 'number')).toThrow(CoercionError);
    });
  });

  describe('boolean', () => {
    it.each([['true'], ['1'], ['yes']])('coerces %s to true', (val) => {
      expect(coerceValue('FLAG', val, 'boolean')).toBe(true);
    });

    it.each([['false'], ['0'], ['no']])('coerces %s to false', (val) => {
      expect(coerceValue('FLAG', val, 'boolean')).toBe(false);
    });

    it('is case-insensitive', () => {
      expect(coerceValue('FLAG', 'TRUE', 'boolean')).toBe(true);
      expect(coerceValue('FLAG', 'FALSE', 'boolean')).toBe(false);
    });

    it('throws CoercionError for invalid value', () => {
      expect(() => coerceValue('FLAG', 'maybe', 'boolean')).toThrow(CoercionError);
    });
  });

  describe('json', () => {
    it('parses valid JSON object', () => {
      expect(coerceValue('CONFIG', '{"a":1}', 'json')).toEqual({ a: 1 });
    });

    it('parses valid JSON array', () => {
      expect(coerceValue('LIST', '[1,2,3]', 'json')).toEqual([1, 2, 3]);
    });

    it('throws CoercionError for invalid JSON', () => {
      expect(() => coerceValue('CONFIG', '{bad json}', 'json')).toThrow(CoercionError);
    });
  });

  describe('CoercionError', () => {
    it('has correct name and message', () => {
      const err = new CoercionError('PORT', 'number', 'abc');
      expect(err.name).toBe('CoercionError');
      expect(err.message).toContain('PORT');
      expect(err.message).toContain('number');
      expect(err.message).toContain('abc');
    });
  });
});
