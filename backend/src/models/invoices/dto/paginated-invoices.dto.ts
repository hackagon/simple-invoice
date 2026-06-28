import { ApiProperty } from '@nestjs/swagger';
import { PagingDto } from '../../../common/dtos';
import { InvoiceDto } from './invoice.dto';

export class PaginatedInvoicesDto {
  @ApiProperty({ type: [InvoiceDto] })
  data: InvoiceDto[];

  @ApiProperty({ type: PagingDto })
  paging: PagingDto;
}
