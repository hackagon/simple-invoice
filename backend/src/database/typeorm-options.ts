import { join } from 'path';
import { DataSourceOptions } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { User } from './entities/user.entity';

const parseBool = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

/**
 * Builds TypeORM connection options from environment variables.
 * Shared by the Nest TypeOrmModule, the standalone seed script and the
 * migration DataSource (CLI) so all three connect identically.
 *
 * The migrations glob uses __dirname so it resolves under both ts-node
 * (src/database/migrations/*.ts) and the compiled build (dist/.../*.js).
 */
export const buildTypeOrmOptions = (): DataSourceOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'simple_invoice',
  entities: [User, Invoice, InvoiceItem],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  migrationsTableName: 'migrations_history',
  synchronize: parseBool(process.env.DB_SYNCHRONIZE, true),
  logging: false,
});
