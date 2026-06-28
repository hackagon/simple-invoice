import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Pagination } from '../components/Pagination';
import { StatusBadge } from '../components/StatusBadge';
import { useDebounce } from '../hooks/useDebounce';
import { getErrorMessage } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/format';
import { fetchInvoices } from '../lib/invoices.api';
import {
  INVOICE_STATUSES,
  type InvoiceQuery,
  type InvoiceStatus,
  type SortField,
  type SortOrdering,
} from '../types/invoice';

const SORT_FIELDS: { value: SortField; label: string }[] = [
  { value: 'invoiceDate', label: 'Invoice Date' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'totalAmount', label: 'Total Amount' },
];

function parseQuery(params: URLSearchParams): InvoiceQuery {
  const status = params.get('status') as InvoiceStatus | null;
  const sortBy = (params.get('sortBy') as SortField) ?? 'invoiceDate';
  const ordering = (params.get('ordering') as SortOrdering) ?? 'DESC';
  return {
    page: Number(params.get('page') ?? '1'),
    pageSize: Number(params.get('pageSize') ?? '10'),
    sortBy,
    ordering,
    status: status ?? undefined,
    keyword: params.get('keyword') ?? undefined,
  };
}

export function InvoiceListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = parseQuery(searchParams);

  // Local keyword state (debounced) so typing doesn't hammer the API.
  const [keywordInput, setKeywordInput] = useState(query.keyword ?? '');
  const debouncedKeyword = useDebounce(keywordInput, 400);

  // Push debounced keyword into the URL query (resetting to page 1).
  useEffect(() => {
    const current = searchParams.get('keyword') ?? '';
    if (debouncedKeyword !== current) {
      updateParams({ keyword: debouncedKeyword || undefined, page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  function updateParams(patch: Partial<Record<string, string | number | undefined>>) {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === '') next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next, { replace: true });
  }

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['invoices', query],
    queryFn: () => fetchInvoices(query),
    placeholderData: keepPreviousData,
  });

  const invoices = data?.data ?? [];

  return (
    <section className="list-page">
      <div className="list-page__header">
        <div>
          <h1>Invoices</h1>
          <p className="muted">Manage and track all invoices in the system.</p>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => navigate('/invoices/new')}
        >
          + New Invoice
        </button>
      </div>

      <div className="toolbar">
        <input
          className="toolbar__search"
          type="search"
          placeholder="Search by invoice number or customer…"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          aria-label="Search invoices"
        />

        <select
          className="toolbar__select"
          value={query.status ?? ''}
          onChange={(e) => updateParams({ status: e.target.value || undefined, page: 1 })}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {INVOICE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          className="toolbar__select"
          value={query.sortBy}
          onChange={(e) => updateParams({ sortBy: e.target.value, page: 1 })}
          aria-label="Sort by"
        >
          {SORT_FIELDS.map((f) => (
            <option key={f.value} value={f.value}>
              Sort: {f.label}
            </option>
          ))}
        </select>

        <button
          className="btn btn--ghost"
          onClick={() =>
            updateParams({ ordering: query.ordering === 'ASC' ? 'DESC' : 'ASC' })
          }
          aria-label="Toggle sort order"
          title={query.ordering === 'ASC' ? 'Ascending' : 'Descending'}
        >
          {query.ordering === 'ASC' ? '↑ Asc' : '↓ Desc'}
        </button>
      </div>

      {isError && (
        <div className="alert alert--error">{getErrorMessage(error)}</div>
      )}

      <div className="table-wrap" aria-busy={isFetching}>
        <table className="table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Invoice Date</th>
              <th>Due Date</th>
              <th className="num">Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="table__empty">
                  Loading invoices…
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="table__empty">
                  No invoices found.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr
                  key={inv.invoiceId}
                  className="table__row--clickable"
                  onClick={() => navigate(`/invoices/${inv.invoiceId}`)}
                >
                  <td data-label="Invoice #">
                    <span className="mono">{inv.invoiceNumber}</span>
                  </td>
                  <td data-label="Customer">{inv.customer.fullname}</td>
                  <td data-label="Invoice Date">{formatDate(inv.invoiceDate)}</td>
                  <td data-label="Due Date">{formatDate(inv.dueDate)}</td>
                  <td data-label="Total" className="num">
                    {formatCurrency(inv.totalAmount, inv.currencySymbol)}
                  </td>
                  <td data-label="Status">
                    <StatusBadge status={inv.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <Pagination
          page={data.paging.page}
          pageSize={data.paging.pageSize}
          total={data.paging.total}
          onPageChange={(page) => updateParams({ page })}
          onPageSizeChange={(pageSize) => updateParams({ pageSize, page: 1 })}
        />
      )}
    </section>
  );
}
