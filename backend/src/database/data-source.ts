import { config as loadEnv } from 'dotenv';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { buildTypeOrmOptions } from './typeorm-options';

loadEnv();

/**
 * Standalone DataSource consumed by the TypeORM CLI for migration
 * generate / run / revert. Synchronize is always disabled here — migrations
 * are the source of truth for the schema in this configuration.
 */
const AppDataSource = new DataSource({
  ...buildTypeOrmOptions(),
  synchronize: false,
});

export default AppDataSource;
