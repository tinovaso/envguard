export type AuditSource = 'env' | 'default' | 'missing';

export interface AuditEntryMeta {
  key: string;
  sensitive: boolean;
  masked: boolean;
  source: AuditSource;
}

export interface AuditOptions {
  /** Include sensitive values in the report (they will still be masked). Default: true */
  includeSensitive?: boolean;
  /** Include keys with missing values in the report. Default: true */
  includeMissing?: boolean;
  /** Custom timestamp override (useful for testing). */
  timestamp?: string;
}

export interface AuditSummary {
  totalKeys: number;
  presentKeys: number;
  missingKeys: number;
  defaultKeys: number;
  sensitiveKeys: number;
}

export function buildAuditSummary(entries: AuditEntryMeta[]): AuditSummary {
  return {
    totalKeys: entries.length,
    presentKeys: entries.filter(e => e.source === 'env').length,
    missingKeys: entries.filter(e => e.source === 'missing').length,
    defaultKeys: entries.filter(e => e.source === 'default').length,
    sensitiveKeys: entries.filter(e => e.sensitive).length,
  };
}
