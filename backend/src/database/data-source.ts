import { config as loadEnv } from 'dotenv';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { buildTypeOrmOptions } from './typeorm-options';

loadEnv();

const AppDataSource = new DataSource({
  ...buildTypeOrmOptions(),
  synchronize: false,
});

export default AppDataSource;
