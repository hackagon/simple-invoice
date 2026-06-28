import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  AuthUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import {
  CreateInvoiceDto,
  InvoiceDto,
  PaginatedInvoicesDto,
  QueryInvoicesDto,
} from './dto';
import { InvoicesService } from './invoices.service';

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'List invoices with search, filter, sort, pagination' })
  @ApiOkResponse({ type: PaginatedInvoicesDto })
  findAll(@Query() query: QueryInvoicesDto): Promise<PaginatedInvoicesDto> {
    return this.invoicesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice detail by ID' })
  @ApiOkResponse({ type: InvoiceDto })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<InvoiceDto> {
    return this.invoicesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiCreatedResponse({ type: InvoiceDto })
  create(
    @Body() dto: CreateInvoiceDto,
    @CurrentUser() user: AuthUser,
  ): Promise<InvoiceDto> {
    return this.invoicesService.create(dto, user.userId);
  }
}
