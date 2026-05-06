import { describe, it, expect } from 'vitest';
import { formatReport, ValidationReport } from './reporter';

describe('formatReport', () => {
  it('shows valid status for passing fields', () => {
    const report: ValidationReport = {
      valid: true,
      errors: [],
      fields: [
        { key: 'PORT', status: 'valid', value: '3000', required: true, description: 'App port' },
      ],
    };
    const output = formatReport(report);
    expect(output).toContain('✅');
    expect(output).toContain('PORT');
    expect(output).toContain('3000');
    expect(output).toContain('App port');
    expect(output).toContain('All environment variables are valid');
  });

  it('shows missing status and errors for failed fields', () => {
    const report: ValidationReport = {
      valid: false,
      errors: ['PORT is required'],
      fields: [
        { key: 'PORT', status: 'missing', required: true },
      ],
    };
    const output = formatReport(report);
    expect(output).toContain('❌');
    expect(output).toContain('(not set)');
    expect(output).toContain('PORT is required');
  });

  it('masks sensitive keys', () => {
    const report: ValidationReport = {
      valid: true,
      errors: [],
      fields: [
        { key: 'API_SECRET', status: 'valid', value: 'supersecret123', required: true },
      ],
    };
    const output = formatReport(report);
    expect(output).not.toContain('supersecret123');
    expect(output).toContain('********');
  });

  it('shows default value indicator', () => {
    const report: ValidationReport = {
      valid: true,
      errors: [],
      fields: [
        { key: 'LOG_LEVEL', status: 'default', defaultValue: 'info', required: false },
      ],
    };
    const output = formatReport(report);
    expect(output).toContain('🔵');
    expect(output).toContain('(default: info)');
  });
});
