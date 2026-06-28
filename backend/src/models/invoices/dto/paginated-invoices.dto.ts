import { ApiProperty } from '@nestjs/swagger';
import { InvoiceDto } from './invoice.dto';
import { PagingDto } from './paging.dto';

export class PaginatedInvoicesDto {
  @ApiProperty({ type: [InvoiceDto] }) data: InvoiceDto[];
  @ApiProperty({ type: PagingDto }) paging: PagingDto;
}
