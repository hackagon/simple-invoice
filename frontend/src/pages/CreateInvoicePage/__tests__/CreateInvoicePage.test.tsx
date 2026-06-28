import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { AxiosError } from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../../../components/Toast';
import { CreateInvoicePage } from '..';

const createInvoiceMock = vi.fn();
vi.mock('../../../lib/invoices.api', () => ({
  createInvoice: (...args: unknown[]) => createInvoiceMock(...args),
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ToastProvider>
          <CreateInvoicePage />
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function fillValid(user: UserEvent) {
  await user.type(screen.getByLabelText(/customer name/i), 'Globex');
  await user.type(screen.getByLabelText(/customer email/i), 'billing@globex.com');
  await user.type(screen.getByLabelText(/invoice number/i), 'INV-T-1');
  await user.type(screen.getByLabelText(/item name/i), 'Widget');
  await user.type(screen.getByLabelText(/rate/i), '500');
}

const submitButton = () =>
  screen.getByRole('button', { name: /create invoice/i });

describe('CreateInvoicePage', () => {
  beforeEach(() => {
    createInvoiceMock.mockReset();
    navigateMock.mockReset();
  });

  it('shows validation errors and does not call the API on empty submit', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(submitButton());

    expect(
      await screen.findByText('Customer name is required'),
    ).toBeInTheDocument();
    expect(screen.getByText('Invoice number is required')).toBeInTheDocument();
    expect(screen.getByText('Item name is required')).toBeInTheDocument();
    expect(createInvoiceMock).not.toHaveBeenCalled();
  });

  it('submits valid data with defaults, then navigates home and toasts success', async () => {
    createInvoiceMock.mockResolvedValue({ invoiceId: 'x' });
    const user = userEvent.setup();
    renderPage();

    await fillValid(user);
    await user.click(submitButton());

    await waitFor(() => expect(createInvoiceMock).toHaveBeenCalledTimes(1));
    expect(createInvoiceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: 'Globex',
        customerEmail: 'billing@globex.com',
        invoiceNumber: 'INV-T-1',
        currency: 'AUD',
        tax: 10,
        discount: 0,
        item: { name: 'Widget', quantity: 1, rate: 500 },
      }),
    );
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/'));
    expect(screen.getByText('Invoice created successfully')).toBeInTheDocument();
  });

  it('surfaces a duplicate invoice-number error on the field', async () => {
    const err = new AxiosError('Conflict');
    err.response = {
      data: { message: 'Invoice number INV-T-1 already exists' },
    } as never;
    createInvoiceMock.mockRejectedValue(err);
    const user = userEvent.setup();
    renderPage();

    await fillValid(user);
    await user.click(submitButton());

    expect(await screen.findByText(/already exists/i)).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
