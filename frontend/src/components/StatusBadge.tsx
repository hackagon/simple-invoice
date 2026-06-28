import type { InvoiceStatus } from '../types/invoice';

/** Coloured pill reflecting the (derived) invoice status. */
export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className={`badge badge--${status.toLowerCase()}`}>{status}</span>
  );
}
