import { deriveStatus } from './invoice.calculations';
import { InvoiceDto } from './dto/invoice-response.dto';
import { Invoice } from '../../database/entities/invoice.entity';

/**
 * Maps an Invoice entity to the API response shape, applying the derived
 * `Overdue` status at read time. `now` is injectable for deterministic tests.
 */
export function serializeInvoice(invoice: Invoice, now: Date = new Date()): InvoiceDto {
  return {
    invoiceId: invoice.invoiceId,
    invoiceNumber: invoice.invoiceNumber,
    invoiceReference: invoice.invoiceReference,
    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.dueDate,
    currency: invoice.currency,
    currencySymbol: invoice.currencySymbol,
    description: invoice.description,
    status: deriveStatus(invoice.status, invoice.dueDate, now),
    customer: {
      fullname: invoice.customerFullname,
      email: invoice.customerEmail,
      mobileNumber: invoice.customerMobile,
      address: invoice.customerAddress,
    },
    invoiceSubTotal: invoice.invoiceSubTotal,
    totalTax: invoice.totalTax,
    totalDiscount: invoice.totalDiscount,
    totalAmount: invoice.totalAmount,
    totalPaid: invoice.totalPaid,
    balanceAmount: invoice.balanceAmount,
    items: (invoice.items ?? [])
      .slice()
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        rate: item.rate,
      })),
    createdBy: invoice.createdBy,
    createdAt: invoice.createdAt,
  };
}
