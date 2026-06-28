import {
  InvoiceStatus,
  InvoiceStatusView,
  InvoiceTotals,
  InvoiceTotalsInput,
} from './interfaces';

/** Round to 2 decimal places, avoiding floating point artefacts. */
const round2 = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * Server-side total calculation. This is the single source of truth for
 * invoice amounts — the frontend never computes these.
 *
 *   subTotal      = quantity * rate
 *   taxAmount     = subTotal * (tax% / 100)
 *   totalAmount   = subTotal + taxAmount - discount
 *   balanceAmount = totalAmount - totalPaid
 */
export function calculateInvoiceTotals(
  input: InvoiceTotalsInput,
): InvoiceTotals {
  const { quantity, rate, taxPercent, discount } = input;
  const totalPaid = input.totalPaid ?? 0;

  const invoiceSubTotal = round2(quantity * rate);
  const totalTax = round2(invoiceSubTotal * (taxPercent / 100));
  const totalDiscount = round2(discount);
  const totalAmount = round2(invoiceSubTotal + totalTax - totalDiscount);
  const balanceAmount = round2(totalAmount - totalPaid);

  return {
    invoiceSubTotal,
    totalTax,
    totalDiscount,
    totalAmount,
    totalPaid: round2(totalPaid),
    balanceAmount,
  };
}

/**
 * Derives the status shown to clients. `Overdue` is never persisted:
 *   if status != "Paid" AND dueDate < today  -> "Overdue"
 *   otherwise                                 -> the persisted status
 *
 * @param dueDate ISO date string (YYYY-MM-DD)
 * @param now reference date (defaults to today); only the date part matters
 */
export function deriveStatus(
  status: InvoiceStatus,
  dueDate: string,
  now: Date = new Date(),
): InvoiceStatusView {
  if (status !== InvoiceStatus.Paid) {
    const today = toDateOnly(now);
    const due = dueDate.slice(0, 10);
    if (due < today) {
      return InvoiceStatusView.Overdue;
    }
  }
  return status as unknown as InvoiceStatusView;
}

/** Format a Date as a local YYYY-MM-DD string. */
export function toDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
