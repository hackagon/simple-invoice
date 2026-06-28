import { InvoiceStatus } from '../../models/invoices/enums/invoice-status.enum';

export interface SeedInvoiceInput {
  invoiceNumber: string;
  invoiceReference: string | null;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  description: string | null;
  status: InvoiceStatus; // persisted status only (never Overdue)
  customer: {
    fullname: string;
    email: string;
    mobileNumber: string | null;
    address: string | null;
  };
  item: { name: string; quantity: number; rate: number };
  tax: number;
  discount: number;
  totalPaid: number;
}

const CUSTOMERS = [
  { fullname: 'Paul Walker', email: 'paul@101digital.io', mobileNumber: '947717364111', address: 'Singapore' },
  { fullname: 'Jane Cooper', email: 'jane.cooper@acme.io', mobileNumber: '6591234567', address: 'Sydney, Australia' },
  { fullname: 'Kanglee Tan', email: 'kanglee@brightside.co', mobileNumber: null, address: 'Kuala Lumpur, Malaysia' },
  { fullname: 'Maria Garcia', email: 'maria.garcia@nova.com', mobileNumber: '447700900123', address: 'London, UK' },
  { fullname: 'Wei Chen', email: 'wei.chen@orbit.io', mobileNumber: '8613800138000', address: 'Shanghai, China' },
  { fullname: 'Aisha Khan', email: 'aisha.khan@summit.org', mobileNumber: null, address: null },
  { fullname: 'Liam Murphy', email: 'liam.murphy@harbor.io', mobileNumber: '353851234567', address: 'Dublin, Ireland' },
  { fullname: 'Sofia Rossi', email: 'sofia.rossi@vista.it', mobileNumber: '393331234567', address: 'Milan, Italy' },
  { fullname: 'David Kim', email: 'david.kim@peak.kr', mobileNumber: null, address: 'Seoul, South Korea' },
  { fullname: 'Emma Wilson', email: 'emma.wilson@crest.nz', mobileNumber: '6421234567', address: 'Auckland, New Zealand' },
];

const PRODUCTS = [
  { name: 'Honda RC150', rate: 1000 },
  { name: 'Annual Cloud Subscription', rate: 250.5 },
  { name: 'Consulting Services (hrs)', rate: 120 },
  { name: 'Office Chair - Ergonomic', rate: 349.99 },
  { name: 'Web Design Package', rate: 1500 },
  { name: 'Laptop Pro 14"', rate: 2399 },
  { name: 'Marketing Retainer', rate: 800 },
  { name: 'Standing Desk', rate: 599.95 },
  { name: 'Support Plan - Gold', rate: 450 },
  { name: 'Software License', rate: 199 },
];

const CURRENCIES = ['AUD', 'USD', 'GBP', 'SGD', 'EUR'];
const STATUSES: InvoiceStatus[] = [
  InvoiceStatus.Draft,
  InvoiceStatus.Pending,
  InvoiceStatus.Paid,
];

/** Deterministic PRNG (mulberry32) so seed runs are reproducible. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Generates a diverse spread of invoices: mixed statuses, currencies,
 * dates (past and future due dates so Overdue can be derived), and amounts.
 * `referenceToday` anchors date generation so the dataset stays meaningful.
 */
export function buildSeedInvoices(
  count: number,
  referenceToday: string,
): SeedInvoiceInput[] {
  const rand = mulberry32(20260627);
  const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
  const invoices: SeedInvoiceInput[] = [];

  for (let i = 0; i < count; i++) {
    const customer = pick(CUSTOMERS);
    const product = pick(PRODUCTS);
    const status = STATUSES[i % STATUSES.length];

    // Spread invoice dates across the last ~5 months.
    const invoiceDate = addDays(referenceToday, -Math.floor(rand() * 150) - 1);
    // Due 14-45 days after invoice date; some land in the past => Overdue.
    const dueDate = addDays(invoiceDate, 14 + Math.floor(rand() * 31));

    const quantity = 1 + Math.floor(rand() * 5);
    const tax = pick([10, 10, 10, 7, 0, 15]);
    const discount = pick([0, 0, 0, 20, 50, 100]);

    const subTotal = quantity * product.rate;
    const totalAmount = subTotal + subTotal * (tax / 100) - discount;
    // Paid => fully paid; others => 0 or partial.
    const totalPaid =
      status === InvoiceStatus.Paid
        ? Math.round(totalAmount * 100) / 100
        : pick([0, 0, Math.round(totalAmount * 0.5 * 100) / 100]);

    invoices.push({
      invoiceNumber: `INV-2026-${String(i + 1).padStart(4, '0')}`,
      invoiceReference: rand() > 0.5 ? `#${5000000 + i}` : null,
      invoiceDate,
      dueDate,
      currency: pick(CURRENCIES),
      description: rand() > 0.5 ? `Invoice issued to ${customer.fullname}` : null,
      status,
      customer,
      item: { name: product.name, quantity, rate: product.rate },
      tax,
      discount,
      totalPaid,
    });
  }

  return invoices;
}
