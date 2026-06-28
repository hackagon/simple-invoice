import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DecimalTransformer } from '../../common/transformers/decimal.transformer';
import { InvoiceStatus } from '../../models/invoices/interfaces';
import { InvoiceItem } from './invoice-item.entity';

/**
 * The customer is stored as embedded fields on the invoice table.
 * This keeps the assessment scope simple; a dedicated `customers` table
 * could be introduced later without changing the public API shape.
 */
@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid', { name: 'invoice_id' })
  invoiceId: string;

  // Unique enforced at the database level (see @Index unique below).
  @Index('UQ_invoices_invoice_number', { unique: true })
  @Column({ name: 'invoice_number' })
  invoiceNumber: string;

  @Column({ name: 'invoice_reference', nullable: true, type: 'varchar' })
  invoiceReference: string | null;

  @Column({ name: 'invoice_date', type: 'date' })
  invoiceDate: string;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: string;

  @Column()
  currency: string;

  @Column({ name: 'currency_symbol' })
  currencySymbol: string;

  @Column({ nullable: true, type: 'varchar' })
  description: string | null;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.Draft })
  status: InvoiceStatus;

  // ----- Embedded customer fields -----
  @Column({ name: 'customer_fullname' })
  customerFullname: string;

  @Column({ name: 'customer_email' })
  customerEmail: string;

  @Column({ name: 'customer_mobile', nullable: true, type: 'varchar' })
  customerMobile: string | null;

  @Column({ name: 'customer_address', nullable: true, type: 'varchar' })
  customerAddress: string | null;

  // ----- Amounts (all calculated server-side) -----
  @Column({
    name: 'invoice_sub_total',
    type: 'decimal',
    precision: 14,
    scale: 2,
    transformer: DecimalTransformer,
  })
  invoiceSubTotal: number;

  @Column({
    name: 'total_tax',
    type: 'decimal',
    precision: 14,
    scale: 2,
    transformer: DecimalTransformer,
  })
  totalTax: number;

  @Column({
    name: 'total_discount',
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
    transformer: DecimalTransformer,
  })
  totalDiscount: number;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 14,
    scale: 2,
    transformer: DecimalTransformer,
  })
  totalAmount: number;

  @Column({
    name: 'total_paid',
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
    transformer: DecimalTransformer,
  })
  totalPaid: number;

  @Column({
    name: 'balance_amount',
    type: 'decimal',
    precision: 14,
    scale: 2,
    transformer: DecimalTransformer,
  })
  balanceAmount: number;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, {
    cascade: true,
    eager: true,
  })
  items: InvoiceItem[];
}
