import { ApiProperty } from '@nestjs/swagger';
import { Invoice } from '../../../database/entities/invoice.entity';

export class CustomerDto {
  @ApiProperty()
  fullname: string;

  @ApiProperty({ nullable: true })
  email: string;

  @ApiProperty({ nullable: true })
  mobileNumber: string | null;

  @ApiProperty({ nullable: true })
  address: string | null;

  static fromEntity(invoice: Invoice): CustomerDto {
    const dto = new CustomerDto();
    dto.fullname = invoice.customerFullname;
    dto.email = invoice.customerEmail;
    dto.mobileNumber = invoice.customerMobile;
    dto.address = invoice.customerAddress;
    return dto;
  }
}
