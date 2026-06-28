import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { Invoice } from '../../../types/invoice';
import { InvoiceDetailPage } from '..';

const fetchInvoiceMock = vi.fn();
vi.mock('../../../lib/invoices.api', () => ({
  fetchInvoice: (...args: unknown[]) => fetchInvoiceMock(...args),
}));

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useParams: () => ({ id: 'id-1' }) };
});

const invoice: Invoice = {
  invoiceId: 'id-1',
  invoiceNumber: 'INV-2026-0001',
  invoiceReference: '#5000000',
  invoiceDate: '2026-03-04',
  dueDate: '2026-03-23',
  currency: 'AUD',
  currencySymbol: 'AU$',
  description: 'Test invoice',
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
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <InvoiceDetailPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('InvoiceDetailPage', () => {
  it('renders the invoice, customer, line item and balance', async () => {
    fetchInvoiceMock.mockResolvedValue(invoice);
    renderPage();

    expect(await screen.findByText('INV-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('Jane Cooper')).toBeInTheDocument();
    expect(screen.getByText('Widget')).toBeInTheDocument();
    expect(screen.getByText('Balance Due')).toBeInTheDocument();
    expect(screen.getAllByText('AU$2,200.00').length).toBeGreaterThan(0);
  });

  it('shows an error state when the invoice cannot be loaded', async () => {
    fetchInvoiceMock.mockRejectedValue(new Error('nope'));
    renderPage();

    await waitFor(() =>
      expect(screen.getByText(/Invoice not found/i)).toBeInTheDocument(),
    );
  });
});
