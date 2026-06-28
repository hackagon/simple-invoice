import { ApiProperty } from '@nestjs/swagger';
import { InvoiceStatusView } from '../enums/invoice-status.enum';

export class CustomerDto {
  @ApiProperty() fullname: string;
  @ApiProperty({ nullable: true }) email: string;
  @ApiProperty({ nullable: true }) mobileNumber: string | null;
  @ApiProperty({ nullable: true }) address: string | null;
}

export class InvoiceItemDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() name: string;
  @ApiProperty() quantity: number;
  @ApiProperty() rate: number;
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
