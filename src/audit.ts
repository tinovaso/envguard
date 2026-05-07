import { SchemaShape } from './schema.types';
import { getSensitiveKeys } from './schema';
import { maskSensitive } from './reporter';

export interface AuditEntry {
  key: string;
  value: unknown;
  source: 'env' | 'default' | 'missing';
  sensitive: boolean;
  masked: boolean;
}

export interface AuditReport {
  timestamp: string;
  entries: AuditEntry[];
  totalKeys: number;
  missingKeys: string[];
  sensitiveKeys: string[];
}

export function auditEnv<S extends SchemaShape>(
  schema: S,
  resolvedEnv: Record<string, unknown>,
  appliedDefaults: Set<string>
): AuditReport {
  const sensitiveKeys = getSensitiveKeys(schema);
  const entries: AuditEntry[] = [];
  const missingKeys: string[] = [];

  for (const key of Object.keys(schema)) {
    const rawValue = resolvedEnv[key];
    const isSensitive = sensitiveKeys.includes(key);
    const isMissing = rawValue === undefined || rawValue === null;

    if (isMissing) {
      missingKeys.push(key);
    }

    const displayValue = isSensitive && !isMissing
      ? maskSensitive(String(rawValue))
      : rawValue;

    entries.push({
      key,
      value: displayValue,
      source: isMissing ? 'missing' : appliedDefaults.has(key) ? 'default' : 'env',
      sensitive: isSensitive,
      masked: isSensitive && !isMissing,
    });
  }

  return {
    timestamp: new Date().toISOString(),
    entries,
    totalKeys: entries.length,
    missingKeys,
    sensitiveKeys,
  };
}

export function formatAuditReport(report: AuditReport): string {
  const lines: string[] = [
    `Env Audit — ${report.timestamp}`,
    `Total keys: ${report.totalKeys} | Missing: ${report.missingKeys.length} | Sensitive: ${report.sensitiveKeys.length}`,
    '',
  ];

  for (const entry of report.entries) {
    const tag = entry.source === 'default' ? '[default]' : entry.source === 'missing' ? '[missing]' : '[env]';
    const maskedTag = entry.masked ? ' [masked]' : '';
    const valueStr = entry.source === 'missing' ? 'N/A' : String(entry.value);
    lines.push(`  ${entry.key}: ${valueStr} ${tag}${maskedTag}`);
  }

  if (report.missingKeys.length > 0) {
    lines.push('');
    lines.push(`Missing keys: ${report.missingKeys.join(', ')}`);
  }

  return lines.join('\n');
}
