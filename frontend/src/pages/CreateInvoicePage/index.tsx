import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast';
import { getErrorMessage } from '../../lib/api';
import { formatCurrency } from '../../lib/format';
import { createInvoice } from '../../lib/invoices.api';
import type { CreateInvoicePayload } from '../../types/invoice';

interface FormValues {
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  customerAddress: string;
  invoiceNumber: string;
  invoiceReference: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  description: string;
  tax: number;
  discount: number;
  itemName: string;
  itemQuantity: number;
  itemRate: number;
}

const CURRENCIES = ['AUD', 'USD', 'GBP', 'SGD', 'EUR', 'NZD'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const today = new Date().toISOString().slice(0, 10);

export function CreateInvoicePage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      currency: 'AUD',
      tax: 10,
      discount: 0,
      itemQuantity: 1,
      invoiceDate: today,
      dueDate: today,
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: CreateInvoicePayload) => createInvoice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      notify('Invoice created successfully', 'success');
      navigate('/');
    },
    onError: (error) => {
      const message = getErrorMessage(error, 'Failed to create invoice');
      if (message.toLowerCase().includes('already exists')) {
        setError('invoiceNumber', { type: 'server', message });
      } else {
        notify(message, 'error');
      }
    },
  });

  // Client-side estimate only — the server computes the authoritative total.
  const invoiceDate = watch('invoiceDate');
  const qty = Number(watch('itemQuantity')) || 0;
  const rate = Number(watch('itemRate')) || 0;
  const tax = Number(watch('tax')) || 0;
  const discount = Number(watch('discount')) || 0;
  const estSubtotal = qty * rate;
  const estTotal = estSubtotal + estSubtotal * (tax / 100) - discount;

  function onSubmit(values: FormValues) {
    const payload: CreateInvoicePayload = {
      customerName: values.customerName.trim(),
      customerEmail: values.customerEmail.trim(),
      customerMobile: values.customerMobile.trim() || undefined,
      customerAddress: values.customerAddress.trim() || undefined,
      invoiceNumber: values.invoiceNumber.trim(),
      invoiceReference: values.invoiceReference.trim() || undefined,
      invoiceDate: values.invoiceDate,
      dueDate: values.dueDate,
      currency: values.currency,
      description: values.description.trim() || undefined,
      tax: Number(values.tax),
      discount: Number(values.discount),
      item: {
        name: values.itemName.trim(),
        quantity: Number(values.itemQuantity),
        rate: Number(values.itemRate),
      },
    };
    mutation.mutate(payload);
  }

  return (
    <section className="form-page">
      <div className="detail-page__top">
        <Link to="/" className="back-link">
          ← Back to invoices
        </Link>
      </div>
      <h1>Create Invoice</h1>

      <form className="invoice-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset className="card">
          <legend className="card__title">Customer</legend>
          <div className="form-grid">
            <label className="field">
              <span className="field__label">Customer name *</span>
              <input
                className="field__input"
                {...register('customerName', { required: 'Customer name is required' })}
                aria-invalid={Boolean(errors.customerName)}
              />
              {errors.customerName && (
                <span className="field__error">{errors.customerName.message}</span>
              )}
            </label>

            <label className="field">
              <span className="field__label">Customer email *</span>
              <input
                className="field__input"
                {...register('customerEmail', {
                  required: 'Customer email is required',
                  pattern: { value: EMAIL_REGEX, message: 'Enter a valid email' },
                })}
                aria-invalid={Boolean(errors.customerEmail)}
              />
              {errors.customerEmail && (
                <span className="field__error">{errors.customerEmail.message}</span>
              )}
            </label>

            <label className="field">
              <span className="field__label">Mobile</span>
              <input className="field__input" {...register('customerMobile')} />
            </label>

            <label className="field">
              <span className="field__label">Address</span>
              <input className="field__input" {...register('customerAddress')} />
            </label>
          </div>
        </fieldset>

        <fieldset className="card">
          <legend className="card__title">Invoice</legend>
          <div className="form-grid">
            <label className="field">
              <span className="field__label">Invoice number *</span>
              <input
                className="field__input"
                {...register('invoiceNumber', { required: 'Invoice number is required' })}
                aria-invalid={Boolean(errors.invoiceNumber)}
              />
              {errors.invoiceNumber && (
                <span className="field__error">{errors.invoiceNumber.message}</span>
              )}
            </label>

            <label className="field">
              <span className="field__label">Reference</span>
              <input className="field__input" {...register('invoiceReference')} />
            </label>

            <label className="field">
              <span className="field__label">Invoice date *</span>
              <input
                type="date"
                className="field__input"
                {...register('invoiceDate', { required: 'Invoice date is required' })}
                aria-invalid={Boolean(errors.invoiceDate)}
              />
              {errors.invoiceDate && (
                <span className="field__error">{errors.invoiceDate.message}</span>
              )}
            </label>

            <label className="field">
              <span className="field__label">Due date *</span>
              <input
                type="date"
                className="field__input"
                {...register('dueDate', {
                  required: 'Due date is required',
                  validate: (value) =>
                    !invoiceDate ||
                    value >= invoiceDate ||
                    'Due date must be on or after invoice date',
                })}
                aria-invalid={Boolean(errors.dueDate)}
              />
              {errors.dueDate && (
                <span className="field__error">{errors.dueDate.message}</span>
              )}
            </label>

            <label className="field">
              <span className="field__label">Currency *</span>
              <select className="field__input" {...register('currency', { required: true })}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field--full">
              <span className="field__label">Description</span>
              <input className="field__input" {...register('description')} />
            </label>
          </div>
        </fieldset>

        <fieldset className="card">
          <legend className="card__title">Line Item</legend>
          <div className="form-grid">
            <label className="field field--full">
              <span className="field__label">Item name *</span>
              <input
                className="field__input"
                {...register('itemName', { required: 'Item name is required' })}
                aria-invalid={Boolean(errors.itemName)}
              />
              {errors.itemName && (
                <span className="field__error">{errors.itemName.message}</span>
              )}
            </label>

            <label className="field">
              <span className="field__label">Quantity *</span>
              <input
                type="number"
                min="1"
                step="1"
                className="field__input"
                {...register('itemQuantity', {
                  required: 'Quantity is required',
                  valueAsNumber: true,
                  min: { value: 1, message: 'Quantity must be a positive integer' },
                  validate: (v) =>
                    Number.isInteger(v) || 'Quantity must be a whole number',
                })}
                aria-invalid={Boolean(errors.itemQuantity)}
              />
              {errors.itemQuantity && (
                <span className="field__error">{errors.itemQuantity.message}</span>
              )}
            </label>

            <label className="field">
              <span className="field__label">Rate *</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="field__input"
                {...register('itemRate', {
                  required: 'Rate is required',
                  valueAsNumber: true,
                  min: { value: 0.01, message: 'Rate must be a positive number' },
                })}
                aria-invalid={Boolean(errors.itemRate)}
              />
              {errors.itemRate && (
                <span className="field__error">{errors.itemRate.message}</span>
              )}
            </label>

            <label className="field">
              <span className="field__label">Tax (%)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="field__input"
                {...register('tax', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'Tax must be non-negative' },
                })}
                aria-invalid={Boolean(errors.tax)}
              />
              {errors.tax && <span className="field__error">{errors.tax.message}</span>}
            </label>

            <label className="field">
              <span className="field__label">Discount</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="field__input"
                {...register('discount', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'Discount must be non-negative' },
                })}
                aria-invalid={Boolean(errors.discount)}
              />
              {errors.discount && (
                <span className="field__error">{errors.discount.message}</span>
              )}
            </label>
          </div>

          <p className="estimate">
            Estimated total:{' '}
            <strong>{formatCurrency(estTotal > 0 ? estTotal : 0, '')}</strong>{' '}
            <span className="muted">
              (final amount is calculated by the server on save)
            </span>
          </p>
        </fieldset>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigate('/')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Creating…' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </section>
  );
}
