import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { InvoiceStatusView } from '../enums/invoice-status.enum';

export enum InvoiceSortField {
  invoiceDate = 'invoiceDate',
  dueDate = 'dueDate',
  totalAmount = 'totalAmount',
}

export enum SortOrdering {
  ASC = 'ASC',
  DESC = 'DESC',
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class QueryInvoicesDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Page number, starting at 1' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100, description: 'Records per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 10;

  @ApiPropertyOptional({
    enum: InvoiceSortField,
    default: InvoiceSortField.invoiceDate,
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsEnum(InvoiceSortField)
  sortBy: InvoiceSortField = InvoiceSortField.invoiceDate;

  @ApiPropertyOptional({ enum: SortOrdering, default: SortOrdering.DESC })
  @IsOptional()
  @IsEnum(SortOrdering)
  ordering: SortOrdering = SortOrdering.DESC;

  @ApiPropertyOptional({
    enum: InvoiceStatusView,
    description: 'Filter by status (includes derived Overdue)',
  })
  @IsOptional()
  @IsEnum(InvoiceStatusView)
  status?: InvoiceStatusView;

  @ApiPropertyOptional({
    description: 'Partial, case-insensitive search on invoice number or customer name',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: 'Filter invoices on/after this date (YYYY-MM-DD)' })
  @IsOptional()
  @Matches(DATE_REGEX, { message: 'fromDate must be a valid date (YYYY-MM-DD)' })
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Filter invoices on/before this date (YYYY-MM-DD)' })
  @IsOptional()
  @Matches(DATE_REGEX, { message: 'toDate must be a valid date (YYYY-MM-DD)' })
  toDate?: string;
}
