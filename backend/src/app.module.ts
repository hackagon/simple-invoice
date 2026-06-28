import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { buildTypeOrmOptions } from './database/typeorm-options';
import { InvoicesModule } from './models/invoices/invoices.module';
import { UsersModule } from './models/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      // ConfigService is injected to guarantee env is loaded before the
      // options (which read process.env) are built.
      useFactory: (config: ConfigService) => ({
        ...buildTypeOrmOptions(),
        autoLoadEntities: true,
        synchronize: config.get<boolean>('database.synchronize'),
        // Run pending migrations on boot when DB_RUN_MIGRATIONS=true.
        migrationsRun: config.get<boolean>('database.runMigrations'),
      }),
    }),
    UsersModule,
    AuthModule,
    InvoicesModule,
  ],
})
export class AppModule {}
