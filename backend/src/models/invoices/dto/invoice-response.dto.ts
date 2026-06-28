import { ApiProperty } from '@nestjs/swagger';
import { Invoice } from '../../../database/entities/invoice.entity';
import { InvoiceItem } from '../../../database/entities/invoice-item.entity';
import { InvoiceStatusView } from '../enums/invoice-status.enum';
import { deriveStatus } from '../invoice.calculations';

export class CustomerDto {
  @ApiProperty() fullname: string;
  @ApiProperty({ nullable: true }) email: string;
  @ApiProperty({ nullable: true }) mobileNumber: string | null;
  @ApiProperty({ nullable: true }) address: string | null;

  static fromEntity(invoice: Invoice): CustomerDto {
    const dto = new CustomerDto();
    dto.fullname = invoice.customerFullname;
    dto.email = invoice.customerEmail;
    dto.mobileNumber = invoice.customerMobile;
    dto.address = invoice.customerAddress;
    return dto;
  }
}

export class InvoiceItemDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() name: string;
  @ApiProperty() quantity: number;
  @ApiProperty() rate: number;

  static fromEntity(item: InvoiceItem): InvoiceItemDto {
    const dto = new InvoiceItemDto();
    dto.id = item.id;
    dto.name = item.name;
    dto.quantity = item.quantity;
    dto.rate = item.rate;
    return dto;
  }
}

export class InvoiceDto {
  @ApiProperty({ format: 'uuid' }) invoiceId: string;
  @ApiProperty() invoiceNumber: string;
  @ApiProperty({ nullable: true }) invoiceReference: string | null;
  @ApiProperty() invoiceDate: string;
  @ApiProperty() dueDate: string;
  @ApiProperty() currency: string;
  @ApiProperty() currencySymbol: string;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty({
    enum: InvoiceStatusView,
    description: 'Derived status — Overdue is computed at read time',
  })
  status: InvoiceStatusView;
  @ApiProperty({ type: CustomerDto }) customer: CustomerDto;
  @ApiProperty() invoiceSubTotal: number;
  @ApiProperty() totalTax: number;
  @ApiProperty() totalDiscount: number;
  @ApiProperty() totalAmount: number;
  @ApiProperty() totalPaid: number;
  @ApiProperty() balanceAmount: number;
  @ApiProperty({ type: [InvoiceItemDto] }) items: InvoiceItemDto[];
  @ApiProperty({ format: 'uuid' }) createdBy: string;
  @ApiProperty() createdAt: Date;

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

export class PagingDto {
  @ApiProperty({ example: 1 }) page: number;
  @ApiProperty({ example: 10 }) pageSize: number;
  @ApiProperty({ example: 100 }) total: number;
}

export class PaginatedInvoicesDto {
  @ApiProperty({ type: [InvoiceDto] }) data: InvoiceDto[];
  @ApiProperty({ type: PagingDto }) paging: PagingDto;
}
