import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { PaginatedInvoices } from '../types/invoice';
import { InvoiceListPage } from './InvoiceListPage';

const fetchInvoicesMock = vi.fn();
vi.mock('../lib/invoices.api', () => ({
  fetchInvoices: (...args: unknown[]) => fetchInvoicesMock(...args),
}));

const sampleResponse: PaginatedInvoices = {
  data: [
    {
      invoiceId: 'id-1',
      invoiceNumber: 'INV-2026-0001',
      invoiceReference: null,
      invoiceDate: '2026-03-04',
      dueDate: '2026-03-23',
      currency: 'AUD',
      currencySymbol: 'AU$',
      description: null,
      status: 'Overdue',
      customer: {
        fullname: 'Jane Cooper',
        email: 'jane@acme.io',
        mobileNumber: null,
        address: null,
      },
      invoiceSubTotal: 2000,
      totalTax: 200,
      totalDiscount: 0,
      totalAmount: 2200,
      totalPaid: 0,
      balanceAmount: 2200,
      items: [{ id: 'it-1', name: 'Widget', quantity: 2, rate: 1000 }],
      createdBy: 'user-1',
      createdAt: '2026-03-04T00:00:00Z',
    },
  ],
  paging: { page: 1, pageSize: 10, total: 1 },
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <InvoiceListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('InvoiceListPage', () => {
  it('renders invoices returned by the API with a derived status badge', async () => {
    fetchInvoicesMock.mockResolvedValue(sampleResponse);
    renderPage();

    expect(await screen.findByText('INV-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('Jane Cooper')).toBeInTheDocument();
    // "Overdue" also appears as a filter option, so target the status badge.
    expect(screen.getByText('Overdue', { selector: '.badge' })).toBeInTheDocument();
    expect(screen.getByText('AU$2,200.00')).toBeInTheDocument();
    expect(screen.getByText(/Showing/)).toHaveTextContent('1');
  });

  it('shows an empty state when there are no invoices', async () => {
    fetchInvoicesMock.mockResolvedValue({
      data: [],
      paging: { page: 1, pageSize: 10, total: 0 },
    });
    renderPage();

    await waitFor(() =>
      expect(screen.getByText(/no invoices found/i)).toBeInTheDocument(),
    );
  });
});
