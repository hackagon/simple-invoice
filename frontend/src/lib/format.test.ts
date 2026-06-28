import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDate } from './format';

describe('formatCurrency', () => {
  it('formats amounts with two decimals and the symbol', () => {
    expect(formatCurrency(2180, 'AU$')).toBe('AU$2,180.00');
    expect(formatCurrency(728.66, '£')).toBe('£728.66');
    expect(formatCurrency(0, '$')).toBe('$0.00');
  });
});

describe('formatDate', () => {
  it('formats a YYYY-MM-DD string', () => {
    expect(formatDate('2026-06-03')).toBe('03 Jun 2026');
  });
  it('handles ISO datetime input by using the date part', () => {
    expect(formatDate('2026-06-03T12:03:26.995Z')).toBe('03 Jun 2026');
  });
  it('returns a dash for empty input', () => {
    expect(formatDate('')).toBe('-');
  });
});
