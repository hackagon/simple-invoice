import { DataSourceOptions } from 'typeorm';
import { Invoice } from '../invoices/entities/invoice.entity';
import { InvoiceItem } from '../invoices/entities/invoice-item.entity';
import { User } from '../users/entities/user.entity';

/**
 * Builds TypeORM connection options from environment variables.
 * Shared by the Nest TypeOrmModule and the standalone seed script so both
 * always connect to the same database with the same entity set.
 */
export const buildTypeOrmOptions = (): DataSourceOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'simple_invoice',
  entities: [User, Invoice, InvoiceItem],
  synchronize: ['1', 'true', 'yes', 'on'].includes(
    (process.env.DB_SYNCHRONIZE ?? 'true').toLowerCase(),
  ),
  logging: false,
});
