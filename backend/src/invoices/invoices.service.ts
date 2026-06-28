import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { currencySymbolFor } from './currency.util';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import {
  InvoiceSortField,
  QueryInvoicesDto,
  SortOrdering,
} from './dto/query-invoices.dto';
import { InvoiceDto, PaginatedInvoicesDto } from './dto/invoice-response.dto';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { InvoiceStatus, InvoiceStatusView } from './enums/invoice-status.enum';
import {
  calculateInvoiceTotals,
  toDateOnly,
} from './invoice.calculations';
import { serializeInvoice } from './invoice.serializer';

const SORT_COLUMN: Record<InvoiceSortField, string> = {
  [InvoiceSortField.invoiceDate]: 'invoice.invoiceDate',
  [InvoiceSortField.dueDate]: 'invoice.dueDate',
  [InvoiceSortField.totalAmount]: 'invoice.totalAmount',
};

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoicesRepository: Repository<Invoice>,
  ) {}

  async findAll(query: QueryInvoicesDto): Promise<PaginatedInvoicesDto> {
    const now = new Date();
    const today = toDateOnly(now);
    const qb = this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.items', 'items');

    // ----- Keyword search (case-insensitive, partial) -----
    if (query.keyword?.trim()) {
      const kw = `%${query.keyword.trim().toLowerCase()}%`;
      qb.andWhere(
        new Brackets((w) => {
          w.where('LOWER(invoice.invoiceNumber) LIKE :kw', { kw }).orWhere(
            'LOWER(invoice.customerFullname) LIKE :kw',
            { kw },
          );
        }),
      );
    }

    // ----- Status filter operating on the DERIVED status -----
    this.applyStatusFilter(qb, query.status, today);

    // ----- Date range on invoiceDate -----
    if (query.fromDate) {
      qb.andWhere('invoice.invoiceDate >= :fromDate', {
        fromDate: query.fromDate,
      });
    }
    if (query.toDate) {
      qb.andWhere('invoice.invoiceDate <= :toDate', { toDate: query.toDate });
    }

    // ----- Sort (with stable tiebreaker) -----
    const direction: 'ASC' | 'DESC' =
      query.ordering === SortOrdering.ASC ? 'ASC' : 'DESC';
    qb.orderBy(SORT_COLUMN[query.sortBy], direction).addOrderBy(
      'invoice.invoiceId',
      'ASC',
    );

    // ----- Server-side pagination -----
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [invoices, total] = await qb.getManyAndCount();

    return {
      data: invoices.map((invoice) => serializeInvoice(invoice, now)),
      paging: { page, pageSize, total },
    };
  }

  async findOne(id: string): Promise<InvoiceDto> {
    const invoice = await this.invoicesRepository.findOne({
      where: { invoiceId: id },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return serializeInvoice(invoice);
  }

  async create(dto: CreateInvoiceDto, userId: string): Promise<InvoiceDto> {
    // Friendly pre-check; the DB unique constraint is the source of truth.
    const existing = await this.invoicesRepository.findOne({
      where: { invoiceNumber: dto.invoiceNumber },
    });
    if (existing) {
      throw new ConflictException(
        `Invoice number ${dto.invoiceNumber} already exists`,
      );
    }

    const taxPercent = dto.tax ?? 10;
    const discount = dto.discount ?? 0;
    const totals = calculateInvoiceTotals({
      quantity: dto.item.quantity,
      rate: dto.item.rate,
      taxPercent,
      discount,
      totalPaid: 0,
    });

    const item = new InvoiceItem();
    item.name = dto.item.name;
    item.quantity = dto.item.quantity;
    item.rate = dto.item.rate;

    const invoice = this.invoicesRepository.create({
      invoiceNumber: dto.invoiceNumber,
      invoiceReference: dto.invoiceReference ?? null,
      invoiceDate: dto.invoiceDate,
      dueDate: dto.dueDate,
      currency: dto.currency.toUpperCase(),
      currencySymbol: currencySymbolFor(dto.currency),
      description: dto.description ?? null,
      status: InvoiceStatus.Draft, // new invoices are always Draft
      customerFullname: dto.customerName,
      customerEmail: dto.customerEmail,
      customerMobile: dto.customerMobile ?? null,
      customerAddress: dto.customerAddress ?? null,
      invoiceSubTotal: totals.invoiceSubTotal,
      totalTax: totals.totalTax,
      totalDiscount: totals.totalDiscount,
      totalAmount: totals.totalAmount,
      totalPaid: totals.totalPaid,
      balanceAmount: totals.balanceAmount,
      createdBy: userId,
      items: [item],
    });

    try {
      const saved = await this.invoicesRepository.save(invoice);
      return serializeInvoice(saved);
    } catch (err) {
      // Postgres unique_violation
      if ((err as { code?: string }).code === '23505') {
        throw new ConflictException(
          `Invoice number ${dto.invoiceNumber} already exists`,
        );
      }
      throw err;
    }
  }

  /**
   * Applies a status filter using DERIVED semantics so the persisted status
   * and the read-time Overdue derivation stay consistent with the list view.
   */
  private applyStatusFilter(
    qb: ReturnType<Repository<Invoice>['createQueryBuilder']>,
    status: InvoiceStatusView | undefined,
    today: string,
  ): void {
    if (!status) return;

    if (status === InvoiceStatusView.Overdue) {
      qb.andWhere('invoice.status != :paid', { paid: InvoiceStatus.Paid })
        .andWhere('invoice.dueDate < :today', { today });
      return;
    }

    if (status === InvoiceStatusView.Paid) {
      qb.andWhere('invoice.status = :status', { status: InvoiceStatus.Paid });
      return;
    }

    // Draft / Pending: persisted status AND not yet overdue.
    qb.andWhere('invoice.status = :status', { status }).andWhere(
      'invoice.dueDate >= :today',
      { today },
    );
  }
}
