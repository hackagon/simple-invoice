import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { IsOnOrAfter } from '../../../common/validators/is-on-or-after.validator';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

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

export class CreateInvoiceDto {
  // ----- Customer -----
  @ApiProperty({ example: 'Paul' })
  @IsString()
  @IsNotEmpty({ message: 'customer name is required' })
  customerName: string;

  @ApiProperty({ example: 'paul@101digital.io' })
  @IsEmail({}, { message: 'customer email must be a valid email address' })
  customerEmail: string;

  @ApiPropertyOptional({ example: '947717364111' })
  @IsOptional()
  @IsString()
  customerMobile?: string;

  @ApiPropertyOptional({ example: 'Singapore' })
  @IsOptional()
  @IsString()
  customerAddress?: string;

  // ----- Invoice -----
  @ApiProperty({ example: 'IV1780488206995', description: 'Must be unique' })
  @IsString()
  @IsNotEmpty({ message: 'invoiceNumber is required' })
  invoiceNumber: string;

  @ApiPropertyOptional({ example: '#5721662' })
  @IsOptional()
  @IsString()
  invoiceReference?: string;

  @ApiProperty({ example: '2026-06-03', description: 'YYYY-MM-DD' })
  @Matches(DATE_REGEX, { message: 'invoiceDate must be a valid date (YYYY-MM-DD)' })
  invoiceDate: string;

  @ApiProperty({
    example: '2026-07-03',
    description: 'YYYY-MM-DD, must be on or after invoiceDate',
  })
  @Matches(DATE_REGEX, { message: 'dueDate must be a valid date (YYYY-MM-DD)' })
  @IsOnOrAfter('invoiceDate', { message: 'dueDate must be on or after invoiceDate' })
  dueDate: string;

  @ApiProperty({ example: 'AUD', description: 'ISO 4217 code e.g. AUD, USD, GBP' })
  @IsString()
  @IsNotEmpty({ message: 'currency is required' })
  currency: string;

  @ApiPropertyOptional({ example: 'Invoice is issued to Kanglee' })
  @IsOptional()
  @IsString()
  description?: string;

  // ----- Amounts inputs -----
  @ApiPropertyOptional({
    example: 10,
    description: 'Tax percentage, non-negative, defaults to 10',
    default: 10,
  })
  @IsOptional()
  @IsNumber({}, { message: 'tax must be a number' })
  @Min(0, { message: 'tax must be a non-negative number' })
  tax?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Discount amount, non-negative, defaults to 0',
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'discount must be a number' })
  @Min(0, { message: 'discount must be a non-negative number' })
  discount?: number;

  // ----- Line item (exactly one for this assessment) -----
  @ApiProperty({ type: CreateInvoiceItemDto })
  @ValidateNested()
  @Type(() => CreateInvoiceItemDto)
  item: CreateInvoiceItemDto;
}
