import { InvoiceStatus, InvoiceStatusView } from './interfaces';
import {
  calculateInvoiceTotals,
  deriveStatus,
  toDateOnly,
} from './invoice.calculations';

describe('calculateInvoiceTotals', () => {
  it('computes subtotal, tax, total and balance correctly', () => {
    const totals = calculateInvoiceTotals({
      quantity: 2,
      rate: 1000,
      taxPercent: 10,
      discount: 20,
      totalPaid: 1451.34,
    });

    // subTotal = 2 * 1000 = 2000; tax = 200; total = 2000 + 200 - 20 = 2180
    expect(totals.invoiceSubTotal).toBe(2000);
    expect(totals.totalTax).toBe(200);
    expect(totals.totalDiscount).toBe(20);
    expect(totals.totalAmount).toBe(2180);
    expect(totals.totalPaid).toBe(1451.34);
    expect(totals.balanceAmount).toBe(728.66);
  });

  it('defaults totalPaid to 0 and yields full balance', () => {
    const totals = calculateInvoiceTotals({
      quantity: 3,
      rate: 50,
      taxPercent: 0,
      discount: 0,
    });
    expect(totals.invoiceSubTotal).toBe(150);
    expect(totals.totalTax).toBe(0);
    expect(totals.totalAmount).toBe(150);
    expect(totals.balanceAmount).toBe(150);
  });

  it('rounds tax to 2 decimal places', () => {
    const totals = calculateInvoiceTotals({
      quantity: 1,
      rate: 99.99,
      taxPercent: 7,
      discount: 0,
    });
    // 99.99 * 0.07 = 6.9993 -> 7.00
    expect(totals.totalTax).toBe(7);
    expect(totals.totalAmount).toBe(106.99);
  });
});

describe('deriveStatus', () => {
  const now = new Date('2026-06-27T10:00:00');

  it('returns Overdue when not paid and due date is in the past', () => {
    expect(deriveStatus(InvoiceStatus.Pending, '2026-06-01', now)).toBe(
      InvoiceStatusView.Overdue,
    );
    expect(deriveStatus(InvoiceStatus.Draft, '2026-06-26', now)).toBe(
      InvoiceStatusView.Overdue,
    );
  });

  it('never marks a Paid invoice as Overdue', () => {
    expect(deriveStatus(InvoiceStatus.Paid, '2020-01-01', now)).toBe(
      InvoiceStatusView.Paid,
    );
  });

  it('returns the persisted status when due date is today or future', () => {
    expect(deriveStatus(InvoiceStatus.Pending, '2026-06-27', now)).toBe(
      InvoiceStatusView.Pending,
    );
    expect(deriveStatus(InvoiceStatus.Draft, '2026-12-31', now)).toBe(
      InvoiceStatusView.Draft,
    );
  });
});

describe('toDateOnly', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(toDateOnly(new Date('2026-06-27T23:59:59'))).toBe('2026-06-27');
  });
});
