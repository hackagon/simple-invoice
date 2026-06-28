import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateInvoiceDto } from './create-invoice.dto';

const valid = {
  customerName: 'Paul',
  customerEmail: 'paul@101digital.io',
  invoiceNumber: 'INV-0001',
  invoiceDate: '2026-06-01',
  dueDate: '2026-07-01',
  currency: 'AUD',
  item: { name: 'Honda RC150', quantity: 2, rate: 1000 },
};

async function validateDto(payload: Record<string, unknown>) {
  const dto = plainToInstance(CreateInvoiceDto, payload);
  return validate(dto);
}

describe('CreateInvoiceDto validation', () => {
  it('passes with a valid payload', async () => {
    expect(await validateDto(valid)).toHaveLength(0);
  });

  it('fails when dueDate is before invoiceDate', async () => {
    const errors = await validateDto({ ...valid, dueDate: '2026-05-01' });
    const dueDateError = errors.find((e) => e.property === 'dueDate');
    expect(dueDateError).toBeDefined();
    expect(Object.values(dueDateError!.constraints ?? {})).toContain(
      'dueDate must be on or after invoiceDate',
    );
  });

  it('fails with an invalid customer email', async () => {
    const errors = await validateDto({ ...valid, customerEmail: 'not-an-email' });
    expect(errors.some((e) => e.property === 'customerEmail')).toBe(true);
  });

  it('fails when item quantity is not a positive integer', async () => {
    const errors = await validateDto({
      ...valid,
      item: { name: 'X', quantity: -1, rate: 10 },
    });
    expect(errors.some((e) => e.property === 'item')).toBe(true);
  });

  it('rejects a non-numeric / negative tax', async () => {
    const errors = await validateDto({ ...valid, tax: -5 });
    expect(errors.some((e) => e.property === 'tax')).toBe(true);
  });
});
