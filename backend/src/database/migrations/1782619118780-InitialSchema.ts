import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1782619118780 implements MigrationInterface {
    name = 'InitialSchema1782619118780'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "invoice_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoice_id" uuid NOT NULL, "name" character varying NOT NULL, "quantity" integer NOT NULL, "rate" numeric(14,2) NOT NULL, CONSTRAINT "PK_53b99f9e0e2945e69de1a12b75a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."invoices_status_enum" AS ENUM('Draft', 'Pending', 'Paid')`);
        await queryRunner.query(`CREATE TABLE "invoices" ("invoice_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoice_number" character varying NOT NULL, "invoice_reference" character varying, "invoice_date" date NOT NULL, "due_date" date NOT NULL, "currency" character varying NOT NULL, "currency_symbol" character varying NOT NULL, "description" character varying, "status" "public"."invoices_status_enum" NOT NULL DEFAULT 'Draft', "customer_fullname" character varying NOT NULL, "customer_email" character varying NOT NULL, "customer_mobile" character varying, "customer_address" character varying, "invoice_sub_total" numeric(14,2) NOT NULL, "total_tax" numeric(14,2) NOT NULL, "total_discount" numeric(14,2) NOT NULL DEFAULT '0', "total_amount" numeric(14,2) NOT NULL, "total_paid" numeric(14,2) NOT NULL DEFAULT '0', "balance_amount" numeric(14,2) NOT NULL, "created_by" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a62eb88a23934fb83945c3e58af" PRIMARY KEY ("invoice_id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_invoices_invoice_number" ON "invoices" ("invoice_number") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "fullname" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "invoice_items" ADD CONSTRAINT "FK_dc991d555664682cfe892eea2c1" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("invoice_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice_items" DROP CONSTRAINT "FK_dc991d555664682cfe892eea2c1"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_invoices_invoice_number"`);
        await queryRunner.query(`DROP TABLE "invoices"`);
        await queryRunner.query(`DROP TYPE "public"."invoices_status_enum"`);
        await queryRunner.query(`DROP TABLE "invoice_items"`);
    }

}
