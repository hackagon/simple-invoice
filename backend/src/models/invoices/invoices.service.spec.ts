import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Invoice } from '../../database/entities/invoice.entity';
import { InvoiceStatus } from './interfaces';
import { InvoicesService } from './invoices.service';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let repo: jest.Mocked<Repository<Invoice>>;

  const baseDto: CreateInvoiceDto = {
    customerName: 'Paul',
    customerEmail: 'paul@101digital.io',
    invoiceNumber: 'INV-0001',
    invoiceDate: '2026-06-01',
    dueDate: '2026-07-01',
    currency: 'AUD',
    item: { name: 'Honda RC150', quantity: 2, rate: 1000 },
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: getRepositoryToken(Invoice),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn((x) => x),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(InvoicesService);
    repo = moduleRef.get(getRepositoryToken(Invoice));
  });

  describe('create', () => {
    it('computes totals server-side, forces Draft status and persists', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.save.mockImplementation(async (inv: any) => ({
        ...inv,
        invoiceId: 'generated-uuid',
        createdAt: new Date(),
      }));

      const result = await service.create(baseDto, 'user-1');

      const savedArg = repo.save.mock.calls[0][0] as Invoice;
      expect(savedArg.status).toBe(InvoiceStatus.Draft);
      expect(savedArg.invoiceSubTotal).toBe(2000);
      expect(savedArg.totalTax).toBe(200); // default 10%
      expect(savedArg.totalDiscount).toBe(0); // default 0
      expect(savedArg.totalAmount).toBe(2200);
      expect(savedArg.balanceAmount).toBe(2200);
      expect(savedArg.createdBy).toBe('user-1');
      expect(result.status).toBeDefined();
    });

    it('rejects a duplicate invoice number (pre-check)', async () => {
      repo.findOne.mockResolvedValue({ invoiceId: 'x' } as Invoice);
      await expect(service.create(baseDto, 'user-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('maps a Postgres unique-violation to ConflictException', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.save.mockRejectedValue({ code: '23505' });
      await expect(service.create(baseDto, 'user-1')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when the invoice does not exist', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
