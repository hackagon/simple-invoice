import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { User } from '../src/users/entities/user.entity';

/**
 * End-to-end test covering a complete key workflow:
 *   login -> create an invoice -> verify it appears in the list and detail.
 *
 * Requires a running PostgreSQL database (configured via the same .env used
 * by the app). Run with: pnpm run test:e2e
 */
describe('SimpleInvoice (e2e)', () => {
  let app: INestApplication;
  let userRepo: Repository<User>;
  let token: string;

  const testEmail = 'e2e-user@101digital.io';
  const testPassword = 'Password123!';
  const uniqueInvoiceNumber = `E2E-${Date.now()}`;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();

    userRepo = moduleRef.get(getRepositoryToken(User));
    await userRepo.delete({ email: testEmail });
    await userRepo.save(
      userRepo.create({
        email: testEmail,
        fullname: 'E2E User',
        passwordHash: await bcrypt.hash(testPassword, 10),
      }),
    );
  });

  afterAll(async () => {
    await app?.close();
  });

  it('rejects login with bad credentials (401)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testEmail, password: 'wrong-password' })
      .expect(401);
  });

  it('logs in and returns a JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testEmail, password: testPassword })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
    token = res.body.accessToken;
  });

  it('blocks unauthenticated access to /invoices (401)', async () => {
    await request(app.getHttpServer()).get('/invoices').expect(401);
  });

  it('rejects an invoice with dueDate before invoiceDate (400)', async () => {
    const res = await request(app.getHttpServer())
      .post('/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerName: 'Test Customer',
        customerEmail: 'test@customer.io',
        invoiceNumber: `${uniqueInvoiceNumber}-bad`,
        invoiceDate: '2026-06-01',
        dueDate: '2026-05-01',
        currency: 'AUD',
        item: { name: 'Widget', quantity: 1, rate: 100 },
      })
      .expect(400);

    expect(res.body.message).toEqual(
      expect.arrayContaining(['dueDate must be on or after invoiceDate']),
    );
  });

  it('creates an invoice with server-calculated totals and Draft status', async () => {
    const res = await request(app.getHttpServer())
      .post('/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerName: 'Acme Corp',
        customerEmail: 'billing@acme.io',
        invoiceNumber: uniqueInvoiceNumber,
        invoiceDate: '2026-06-01',
        dueDate: '2026-07-01',
        currency: 'AUD',
        tax: 10,
        discount: 20,
        item: { name: 'Honda RC150', quantity: 2, rate: 1000 },
      })
      .expect(201);

    expect(res.body.status).toBe('Draft');
    expect(res.body.invoiceSubTotal).toBe(2000);
    expect(res.body.totalTax).toBe(200);
    expect(res.body.totalAmount).toBe(2180);
    expect(res.body.balanceAmount).toBe(2180);
  });

  it('rejects a duplicate invoice number (409)', async () => {
    await request(app.getHttpServer())
      .post('/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerName: 'Acme Corp',
        customerEmail: 'billing@acme.io',
        invoiceNumber: uniqueInvoiceNumber,
        invoiceDate: '2026-06-01',
        dueDate: '2026-07-01',
        currency: 'AUD',
        item: { name: 'Honda RC150', quantity: 2, rate: 1000 },
      })
      .expect(409);
  });

  it('finds the created invoice via keyword search in the list', async () => {
    const res = await request(app.getHttpServer())
      .get('/invoices')
      .set('Authorization', `Bearer ${token}`)
      .query({ keyword: uniqueInvoiceNumber })
      .expect(200);

    expect(res.body.paging.total).toBeGreaterThanOrEqual(1);
    const found = res.body.data.find(
      (i: { invoiceNumber: string }) => i.invoiceNumber === uniqueInvoiceNumber,
    );
    expect(found).toBeDefined();
    expect(found.customer.fullname).toBe('Acme Corp');
  });

  it('returns 404 for a non-existent invoice id', async () => {
    await request(app.getHttpServer())
      .get('/invoices/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
