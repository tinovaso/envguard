import type { SanitizeRule, SanitizeOptions, SanitizeResult } from './sanitize.types';

/**
 * Applies a single sanitize rule to a string value.
 */
export function applyRule(value: string, rule: SanitizeRule): string {
  switch (rule.type) {
    case 'trim':
      return value.trim();
    case 'lowercase':
      return value.toLowerCase();
    case 'uppercase':
      return value.toUpperCase();
    case 'replace':
      return value.replace(rule.pattern as string | RegExp, rule.replacement);
    case 'truncate':
      return value.slice(0, rule.maxLength);
    default:
      return value;
  }
}

/**
 * Sanitizes a single value by applying all rules in order.
 */
export function sanitizeValue(value: string, rules: SanitizeRule[]): string {
  return rules.reduce((acc, rule) => applyRule(acc, rule), value);
}

/**
 * Sanitizes all environment variable values according to the provided options.
 * Returns original values, sanitized values, and a list of changed keys.
 */
export function sanitizeEnv(
  env: Record<string, string>,
  options: SanitizeOptions
): SanitizeResult {
  const { rules, skip = [] } = options;
  const original: Record<string, string> = { ...env };
  const sanitized: Record<string, string> = {};
  const changed: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    if (skip.includes(key)) {
      sanitized[key] = value;
      continue;
    }
    const result = sanitizeValue(value, rules);
    sanitized[key] = result;
    if (result !== value) {
      changed.push(key);
    }
  }

  return { original, sanitized, changed };
}

/**
 * Formats a human-readable summary of sanitization changes.
 */
export function formatSanitizeReport(result: SanitizeResult): string {
  if (result.changed.length === 0) {
    return 'sanitize: no changes applied';
  }
  const lines = result.changed.map(
    (key) => `  ${key}: ${JSON.stringify(result.original[key])} → ${JSON.stringify(result.sanitized[key])}`
  );
  return `sanitize: ${result.changed.length} value(s) changed\n${lines.join('\n')}`;
}
