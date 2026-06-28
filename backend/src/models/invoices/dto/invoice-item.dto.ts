import { ApiProperty } from '@nestjs/swagger';
import { InvoiceItem } from '../../../database/entities/invoice-item.entity';

export class InvoiceItemDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  rate: number;

  static fromEntity(item: InvoiceItem): InvoiceItemDto {
    const dto = new InvoiceItemDto();
    dto.id = item.id;
    dto.name = item.name;
    dto.quantity = item.quantity;
    dto.rate = item.rate;
    return dto;
  }
}
