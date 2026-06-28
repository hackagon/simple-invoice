/* eslint-disable no-console */
import * as bcrypt from 'bcrypt';
import { config as loadEnv } from 'dotenv';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Invoice } from '../entities/invoice.entity';
import { InvoiceItem } from '../entities/invoice-item.entity';
import { calculateInvoiceTotals, toDateOnly } from '../../models/invoices/invoice.calculations';
import { currencySymbolFor } from '../../models/invoices/currency.util';
import { User } from '../entities/user.entity';
import { buildTypeOrmOptions } from '../typeorm-options';
import { buildSeedInvoices } from './seed-data';

loadEnv();

const SEED_COUNT = 32; // within the recommended 20-50 range

async function seed(): Promise<void> {
  const options = buildTypeOrmOptions();
  const dataSource = new DataSource(options);

  await dataSource.initialize();
  console.log('Connected. Seeding database...');

  // Ensure the schema exists before seeding. With synchronize on (dev default)
  // the schema is created on initialize; otherwise apply pending migrations.
  if (!options.synchronize) {
    const applied = await dataSource.runMigrations();
    if (applied.length) {
      console.log(`Applied ${applied.length} migration(s) before seeding.`);
    }
  }

  const userRepo = dataSource.getRepository(User);
  const invoiceRepo = dataSource.getRepository(Invoice);
  const itemRepo = dataSource.getRepository(InvoiceItem);

  // When invoked on container boot (SEED_SKIP_IF_POPULATED=true), don't wipe a
  // database that already has data. Manual `pnpm run seed` always reseeds.
  if (process.env.SEED_SKIP_IF_POPULATED === 'true') {
    const existingCount = await invoiceRepo.count();
    if (existingCount > 0) {
      console.log(
        `Database already has ${existingCount} invoices — skipping seed.`,
      );
      await dataSource.destroy();
      return;
    }
  }

  // ----- Reset existing data (idempotent reseed) -----
  await itemRepo.createQueryBuilder().delete().execute();
  await invoiceRepo.createQueryBuilder().delete().execute();

  // ----- Default reviewer account -----
  const email = process.env.SEED_USER_EMAIL ?? 'admin@101digital.io';
  const password = process.env.SEED_USER_PASSWORD ?? 'Password123!';
  const fullname = process.env.SEED_USER_FULLNAME ?? 'Reviewer Admin';

  let user = await userRepo.findOne({ where: { email } });
  if (!user) {
    user = userRepo.create({
      email,
      fullname,
      passwordHash: await bcrypt.hash(password, 10),
    });
    user = await userRepo.save(user);
    console.log(`Created seed user: ${email}`);
  } else {
    // Keep credentials in sync with the documented defaults.
    user.passwordHash = await bcrypt.hash(password, 10);
    user.fullname = fullname;
    user = await userRepo.save(user);
    console.log(`Updated existing seed user: ${email}`);
  }

  // ----- Invoices -----
  const today = toDateOnly(new Date());
  const seedInputs = buildSeedInvoices(SEED_COUNT, today);

  const invoices = seedInputs.map((input) => {
    const totals = calculateInvoiceTotals({
      quantity: input.item.quantity,
      rate: input.item.rate,
      taxPercent: input.tax,
      discount: input.discount,
      totalPaid: input.totalPaid,
    });

    const item = itemRepo.create({
      name: input.item.name,
      quantity: input.item.quantity,
      rate: input.item.rate,
    });

    return invoiceRepo.create({
      invoiceNumber: input.invoiceNumber,
      invoiceReference: input.invoiceReference,
      invoiceDate: input.invoiceDate,
      dueDate: input.dueDate,
      currency: input.currency,
      currencySymbol: currencySymbolFor(input.currency),
      description: input.description,
      status: input.status,
      customerFullname: input.customer.fullname,
      customerEmail: input.customer.email,
      customerMobile: input.customer.mobileNumber,
      customerAddress: input.customer.address,
      invoiceSubTotal: totals.invoiceSubTotal,
      totalTax: totals.totalTax,
      totalDiscount: totals.totalDiscount,
      totalAmount: totals.totalAmount,
      totalPaid: totals.totalPaid,
      balanceAmount: totals.balanceAmount,
      createdBy: user.id,
      items: [item],
    });
  });

  await invoiceRepo.save(invoices);
  console.log(`Seeded ${invoices.length} invoices.`);

  const overdueCount = invoices.filter(
    (inv) => inv.status !== 'Paid' && inv.dueDate < today,
  ).length;
  console.log(
    `(${overdueCount} invoices have a past due date and will derive as "Overdue" at read time.)`,
  );

  await dataSource.destroy();
  console.log('Seeding complete.');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
