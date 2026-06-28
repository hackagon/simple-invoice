import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateInvoiceItemDto {
  @ApiProperty({ example: 'Honda RC150' })
  @IsString()
  @IsNotEmpty({ message: 'item name is required' })
  name: string;

  @ApiProperty({ example: 2, description: 'Positive integer' })
  @IsInt({ message: 'quantity must be an integer' })
  @IsPositive({ message: 'quantity must be a positive integer' })
  quantity: number;

  @ApiProperty({ example: 1000, description: 'Positive number' })
  @IsNumber({}, { message: 'rate must be a number' })
  @IsPositive({ message: 'rate must be a positive number' })
  rate: number;
}
