import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { getErrorMessage } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/format';
import { fetchInvoice } from '../lib/invoices.api';

export function InvoiceDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();

  const { data: invoice, isLoading, isError, error } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => fetchInvoice(id),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return <div className="page-center">Loading invoice…</div>;
  }

  if (isError || !invoice) {
    return (
      <div className="detail-page">
        <div className="alert alert--error">
          {getErrorMessage(error, 'Invoice not found')}
        </div>
        <button className="btn btn--ghost" onClick={() => navigate('/')}>
          ← Back to invoices
        </button>
      </div>
    );
  }

  const sym = invoice.currencySymbol;

  return (
    <section className="detail-page">
      <div className="detail-page__top">
        <Link to="/" className="back-link">
          ← Back to invoices
        </Link>
      </div>

      <div className="card detail-header">
        <div>
          <h1 className="detail-header__number">{invoice.invoiceNumber}</h1>
          {invoice.invoiceReference && (
            <p className="muted">Ref: {invoice.invoiceReference}</p>
          )}
          {invoice.description && <p>{invoice.description}</p>}
        </div>
        <div className="detail-header__status">
          <StatusBadge status={invoice.status} />
          <p className="muted detail-header__currency">{invoice.currency}</p>
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <h2 className="card__title">Customer</h2>
          <dl className="info-list">
            <div>
              <dt>Name</dt>
              <dd>{invoice.customer.fullname}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{invoice.customer.email}</dd>
            </div>
            <div>
              <dt>Mobile</dt>
              <dd>{invoice.customer.mobileNumber ?? '—'}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{invoice.customer.address ?? '—'}</dd>
            </div>
          </dl>
        </div>

        <div className="card">
          <h2 className="card__title">Invoice</h2>
          <dl className="info-list">
            <div>
              <dt>Invoice Date</dt>
              <dd>{formatDate(invoice.invoiceDate)}</dd>
            </div>
            <div>
              <dt>Due Date</dt>
              <dd>{formatDate(invoice.dueDate)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge status={invoice.status} />
              </dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{formatDate(invoice.createdAt)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="card">
        <h2 className="card__title">Line Items</h2>
        <table className="table table--items">
          <thead>
            <tr>
              <th>Item</th>
              <th className="num">Qty</th>
              <th className="num">Rate</th>
              <th className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td data-label="Item">{item.name}</td>
                <td data-label="Qty" className="num">
                  {item.quantity}
                </td>
                <td data-label="Rate" className="num">
                  {formatCurrency(item.rate, sym)}
                </td>
                <td data-label="Amount" className="num">
                  {formatCurrency(item.quantity * item.rate, sym)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="totals">
          <div className="totals__row">
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.invoiceSubTotal, sym)}</span>
          </div>
          <div className="totals__row">
            <span>Tax</span>
            <span>{formatCurrency(invoice.totalTax, sym)}</span>
          </div>
          <div className="totals__row">
            <span>Discount</span>
            <span>-{formatCurrency(invoice.totalDiscount, sym)}</span>
          </div>
          <div className="totals__row totals__row--strong">
            <span>Total</span>
            <span>{formatCurrency(invoice.totalAmount, sym)}</span>
          </div>
          <div className="totals__row">
            <span>Paid</span>
            <span>{formatCurrency(invoice.totalPaid, sym)}</span>
          </div>
          <div className="totals__row totals__row--balance">
            <span>Balance Due</span>
            <span>{formatCurrency(invoice.balanceAmount, sym)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
