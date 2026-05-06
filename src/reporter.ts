export type ValidationStatus = 'valid' | 'missing' | 'invalid' | 'default';

export interface FieldReport {
  key: string;
  status: ValidationStatus;
  value?: string;
  defaultValue?: string;
  description?: string;
  required: boolean;
}

export interface ValidationReport {
  valid: boolean;
  fields: FieldReport[];
  errors: string[];
}

export function formatReport(report: ValidationReport): string {
  const lines: string[] = [];

  lines.push('╔══════════════════════════════════════════╗');
  lines.push('║         envguard — Env Validation        ║');
  lines.push('╚══════════════════════════════════════════╝');
  lines.push('');

  for (const field of report.fields) {
    const icon =
      field.status === 'valid' ? '✅' :
      field.status === 'default' ? '🔵' :
      field.status === 'missing' ? '❌' : '⚠️';

    const displayValue =
      field.status === 'missing' ? '(not set)' :
      field.status === 'default' ? `(default: ${field.defaultValue})` :
      maskSensitive(field.key, field.value ?? '');

    lines.push(`  ${icon} ${field.key.padEnd(30)} ${displayValue}`);
    if (field.description) {
      lines.push(`       ${field.description}`);
    }
  }

  lines.push('');

  if (report.valid) {
    lines.push('  ✅ All environment variables are valid.');
  } else {
    lines.push('  ❌ Validation failed:');
    for (const err of report.errors) {
      lines.push(`     • ${err}`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

function maskSensitive(key: string, value: string): string {
  const sensitivePattern = /secret|password|token|key|auth/i;
  if (sensitivePattern.test(key) && value.length > 0) {
    return '*'.repeat(Math.min(value.length, 8));
  }
  return value;
}
