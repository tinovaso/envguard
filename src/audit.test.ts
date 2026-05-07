import { describe, it, expect } from 'vitest';
import { auditEnv, formatAuditReport } from './audit';
import { buildAuditSummary } from './audit.types';

const schema = {
  PORT: { type: 'number' as const, default: 3000, description: 'Server port' },
  DATABASE_URL: { type: 'string' as const, required: true, description: 'DB connection' },
  API_SECRET: { type: 'string' as const, sensitive: true, required: true, description: 'Secret key' },
};

describe('auditEnv', () => {
  it('marks env-sourced keys correctly', () => {
    const resolved = { PORT: 8080, DATABASE_URL: 'postgres://localhost', API_SECRET: 'abc123' };
    const report = auditEnv(schema, resolved, new Set());
    const portEntry = report.entries.find(e => e.key === 'PORT')!;
    expect(portEntry.source).toBe('env');
  });

  it('marks default-sourced keys correctly', () => {
    const resolved = { PORT: 3000, DATABASE_URL: 'postgres://localhost', API_SECRET: 'abc123' };
    const report = auditEnv(schema, resolved, new Set(['PORT']));
    const portEntry = report.entries.find(e => e.key === 'PORT')!;
    expect(portEntry.source).toBe('default');
  });

  it('marks missing keys correctly', () => {
    const resolved = { PORT: 3000 };
    const report = auditEnv(schema, resolved, new Set(['PORT']));
    expect(report.missingKeys).toContain('DATABASE_URL');
    expect(report.missingKeys).toContain('API_SECRET');
  });

  it('masks sensitive values', () => {
    const resolved = { PORT: 3000, DATABASE_URL: 'postgres://localhost', API_SECRET: 'supersecret' };
    const report = auditEnv(schema, resolved, new Set());
    const secretEntry = report.entries.find(e => e.key === 'API_SECRET')!;
    expect(secretEntry.masked).toBe(true);
    expect(secretEntry.value).not.toBe('supersecret');
  });

  it('reports sensitive keys list', () => {
    const resolved = { PORT: 3000, DATABASE_URL: 'postgres://localhost', API_SECRET: 'abc' };
    const report = auditEnv(schema, resolved, new Set());
    expect(report.sensitiveKeys).toContain('API_SECRET');
  });
});

describe('formatAuditReport', () => {
  it('includes timestamp in output', () => {
    const resolved = { PORT: 3000, DATABASE_URL: 'postgres://localhost', API_SECRET: 'abc' };
    const report = auditEnv(schema, resolved, new Set());
    const output = formatAuditReport(report);
    expect(output).toContain('Env Audit');
  });

  it('shows missing keys section when applicable', () => {
    const resolved = { PORT: 3000 };
    const report = auditEnv(schema, resolved, new Set(['PORT']));
    const output = formatAuditReport(report);
    expect(output).toContain('Missing keys');
  });
});

describe('buildAuditSummary', () => {
  it('computes correct summary counts', () => {
    const entries = [
      { key: 'A', sensitive: false, masked: false, source: 'env' as const },
      { key: 'B', sensitive: true, masked: true, source: 'default' as const },
      { key: 'C', sensitive: false, masked: false, source: 'missing' as const },
    ];
    const summary = buildAuditSummary(entries);
    expect(summary.totalKeys).toBe(3);
    expect(summary.presentKeys).toBe(1);
    expect(summary.defaultKeys).toBe(1);
    expect(summary.missingKeys).toBe(1);
    expect(summary.sensitiveKeys).toBe(1);
  });
});
