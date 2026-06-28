import { ApiProperty } from '@nestjs/swagger';
import { Invoice } from '../../../database/entities/invoice.entity';
import { InvoiceStatusView } from '../enums/invoice-status.enum';
import { deriveStatus } from '../invoice.calculations';
import { CustomerDto } from './customer.dto';
import { InvoiceItemDto } from './invoice-item.dto';

export class InvoiceDto {
  @ApiProperty({ format: 'uuid' })
  invoiceId: string;

  @ApiProperty()
  invoiceNumber: string;

  @ApiProperty({ nullable: true })
  invoiceReference: string | null;

  @ApiProperty()
  invoiceDate: string;

  @ApiProperty()
  dueDate: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  currencySymbol: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty({
    enum: InvoiceStatusView,
    description: 'Derived status — Overdue is computed at read time',
  })
  status: InvoiceStatusView;

  @ApiProperty({ type: CustomerDto })
  customer: CustomerDto;

  @ApiProperty()
  invoiceSubTotal: number;

  @ApiProperty()
  totalTax: number;

  @ApiProperty()
  totalDiscount: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  totalPaid: number;

  @ApiProperty()
  balanceAmount: number;

  @ApiProperty({ type: [InvoiceItemDto] })
  items: InvoiceItemDto[];

  @ApiProperty({ format: 'uuid' })
  createdBy: string;

  @ApiProperty()
  createdAt: Date;

  /**
   * Maps an Invoice entity to the API response shape, applying the derived
   * `Overdue` status at read time. `now` is injectable for deterministic tests.
   */
  static fromEntity(invoice: Invoice, now: Date = new Date()): InvoiceDto {
    const dto = new InvoiceDto();
    dto.invoiceId = invoice.invoiceId;
    dto.invoiceNumber = invoice.invoiceNumber;
    dto.invoiceReference = invoice.invoiceReference;
    dto.invoiceDate = invoice.invoiceDate;
    dto.dueDate = invoice.dueDate;
    dto.currency = invoice.currency;
    dto.currencySymbol = invoice.currencySymbol;
    dto.description = invoice.description;
    dto.status = deriveStatus(invoice.status, invoice.dueDate, now);
    dto.customer = CustomerDto.fromEntity(invoice);
    dto.invoiceSubTotal = invoice.invoiceSubTotal;
    dto.totalTax = invoice.totalTax;
    dto.totalDiscount = invoice.totalDiscount;
    dto.totalAmount = invoice.totalAmount;
    dto.totalPaid = invoice.totalPaid;
    dto.balanceAmount = invoice.balanceAmount;
    dto.items = (invoice.items ?? [])
      .slice()
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((item) => InvoiceItemDto.fromEntity(item));
    dto.createdBy = invoice.createdBy;
    dto.createdAt = invoice.createdAt;
    return dto;
  }
}
