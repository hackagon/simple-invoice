/**
 * Statuses persisted in the database.
 * NOTE: `Overdue` is intentionally NOT part of this enum — it is a derived
 * status computed at read time and is never written to the database.
 */
export enum InvoiceStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Paid = 'Paid',
}

/**
 * The full set of statuses a client may see / filter by, including the
 * derived `Overdue` value.
 */
export enum InvoiceStatusView {
  Draft = 'Draft',
  Pending = 'Pending',
  Paid = 'Paid',
  Overdue = 'Overdue',
}
