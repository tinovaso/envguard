export type SanitizeRule =
  | { type: 'trim' }
  | { type: 'lowercase' }
  | { type: 'uppercase' }
  | { type: 'replace'; pattern: string | RegExp; replacement: string }
  | { type: 'truncate'; maxLength: number };

export interface SanitizeOptions {
  rules: SanitizeRule[];
  /** Keys to skip during sanitization */
  skip?: string[];
}

export interface SanitizeResult {
  original: Record<string, string>;
  sanitized: Record<string, string>;
  changed: string[];
}
