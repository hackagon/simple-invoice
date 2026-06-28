// Persisted statuses. `Overdue` is intentionally excluded — it is derived at
// read time and never written to the database.
export enum InvoiceStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Paid = 'Paid',
}

// The full set of statuses a client may see / filter by, including derived Overdue.
export enum InvoiceStatusView {
  Draft = 'Draft',
  Pending = 'Pending',
  Paid = 'Paid',
  Overdue = 'Overdue',
}

export enum InvoiceSortField {
  invoiceDate = 'invoiceDate',
  dueDate = 'dueDate',
  totalAmount = 'totalAmount',
}

export enum SortOrdering {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface InvoiceTotalsInput {
  quantity: number;
  rate: number;
  taxPercent: number;
  discount: number;
  totalPaid?: number;
}

export interface InvoiceTotals {
  invoiceSubTotal: number;
  totalTax: number;
  totalDiscount: number;
  totalAmount: number;
  totalPaid: number;
  balanceAmount: number;
}
