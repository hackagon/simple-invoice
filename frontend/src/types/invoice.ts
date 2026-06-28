export type InvoiceStatus = 'Draft' | 'Pending' | 'Paid' | 'Overdue';

export const INVOICE_STATUSES: InvoiceStatus[] = [
  'Draft',
  'Pending',
  'Paid',
  'Overdue',
];

export type SortField = 'invoiceDate' | 'dueDate' | 'totalAmount';
export type SortOrdering = 'ASC' | 'DESC';

export interface Customer {
  fullname: string;
  email: string;
  mobileNumber: string | null;
  address: string | null;
}

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  rate: number;
}

export interface Invoice {
  invoiceId: string;
  invoiceNumber: string;
  invoiceReference: string | null;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  currencySymbol: string;
  description: string | null;
  status: InvoiceStatus;
  customer: Customer;
  invoiceSubTotal: number;
  totalTax: number;
  totalDiscount: number;
  totalAmount: number;
  totalPaid: number;
  balanceAmount: number;
  items: InvoiceItem[];
  createdBy: string;
  createdAt: string;
}

export interface Paging {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginatedInvoices {
  data: Invoice[];
  paging: Paging;
}

export interface InvoiceQuery {
  page: number;
  pageSize: number;
  sortBy: SortField;
  ordering: SortOrdering;
  status?: InvoiceStatus;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
}

export interface CreateInvoicePayload {
  customerName: string;
  customerEmail: string;
  customerMobile?: string;
  customerAddress?: string;
  invoiceNumber: string;
  invoiceReference?: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  description?: string;
  tax?: number;
  discount?: number;
  item: {
    name: string;
    quantity: number;
    rate: number;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  fullname: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}
