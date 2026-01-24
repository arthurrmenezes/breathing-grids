// Transaction Types

export interface TransactionInstallmentItem {
  id: string;
  invoiceId?: string;
  number: number;
  amount: number;
  dueDate: string;
  status: string;
  paidAt?: string;
  updatedAt?: string;
  createdAt: string;
}

export interface TransactionInstallment {
  id: string;
  totalInstallments: number;
  totalAmount: number;
  firstPaymentDate: string;
  status: string;
  installments?: TransactionInstallmentItem[];
  installmentItems?: TransactionInstallmentItem[];
}

export interface Transaction {
  id: string;
  accountId: string;
  cardId: string;
  categoryId: string;
  installmentId?: string;
  invoiceId?: string;
  title: string;
  description?: string;
  amount: number;
  date: string;
  transactionType: string;
  paymentMethod: string;
  status: string;
  destination?: string;
  installment?: TransactionInstallment;
  installments?: TransactionInstallment[];
  updatedAt?: string;
  createdAt: string;
}

export interface TransactionWithInstallment extends Transaction {
  installment?: TransactionInstallment;
}

export interface CreateTransactionInstallmentInput {
  totalInstallments: number;
}

export interface CreateTransactionInput {
  cardId: string;
  categoryId: string;
  title: string;
  description?: string;
  amount: number;
  date: string;
  transactionType: number;
  paymentMethod: number;
  status: number;
  destination?: string;
  hasInstallment?: CreateTransactionInstallmentInput;
}

export interface UpdateTransactionInput {
  categoryId?: string;
  title?: string;
  description?: string;
  amount?: number;
  date?: string;
  status?: number;
  destination?: string;
}

export interface TransactionsListResponse {
  totalTransactions: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  transactions: Transaction[];
}

export interface GetTransactionsParams {
  pageNumber?: number;
  pageSize?: number;
  cardId?: string;
  transactionType?: number;
  categoryId?: string;
  paymentMethod?: number;
  paymentStatus?: number;
  startDate?: string;
  endDate?: string;
  minValue?: number;
  maxValue?: number;
  textSearch?: string;
  hasInstallment?: boolean;
}

export interface FinancialSummary {
  periodIncome: number;
  periodExpense: number;
  balance: number;
  startDate: string;
  endDate: string;
}

// Enums for API - Matching backend exactly
export const TransactionTypeEnum = {
  Receita: 0,
  Despesa: 1,
} as const;

// Backend PaymentMethod enum - CORRECT ORDER
export const PaymentMethodEnum = {
  Credit: 0,
  Debit: 1,
  Pix: 2,
  TED: 3,
  Boleto: 4,
  Cash: 5,
  Cheque: 6,
  CryptoWallet: 7,
  Voucher: 8,
  Other: 9,
} as const;

export const PaymentStatusEnum = {
  Pendente: 0,
  Pago: 1,
  Atrasado: 2,
} as const;

// Labels for display - mapping backend values to Portuguese
export const TransactionTypeLabels: Record<string, string> = {
  'Income': 'Receita',
  'Expense': 'Despesa',
  'Receita': 'Receita',
  'Despesa': 'Despesa',
};

// Mapping backend paymentMethod string to display labels
export const PaymentMethodLabels: Record<string, string> = {
  'Credit': 'Cartão Crédito',
  'Debit': 'Cartão Débito',
  'Pix': 'Pix',
  'TED': 'TED',
  'Boleto': 'Boleto',
  'Cash': 'Dinheiro',
  'Cheque': 'Cheque',
  'CryptoWallet': 'Crypto Wallet',
  'Voucher': 'Voucher',
  'Other': 'Outro',
};

export const PaymentStatusLabels: Record<string, string> = {
  'Pending': 'Pendente',
  'Paid': 'Pago',
  'Overdue': 'Atrasado',
};

// All payment method options
export const AllPaymentMethodOptions = [
  { label: 'Cartão Crédito', value: PaymentMethodEnum.Credit },
  { label: 'Cartão Débito', value: PaymentMethodEnum.Debit },
  { label: 'Pix', value: PaymentMethodEnum.Pix },
  { label: 'TED', value: PaymentMethodEnum.TED },
  { label: 'Boleto', value: PaymentMethodEnum.Boleto },
  { label: 'Dinheiro', value: PaymentMethodEnum.Cash },
  { label: 'Cheque', value: PaymentMethodEnum.Cheque },
  { label: 'Crypto Wallet', value: PaymentMethodEnum.CryptoWallet },
  { label: 'Voucher', value: PaymentMethodEnum.Voucher },
  { label: 'Outro', value: PaymentMethodEnum.Other },
];

// Credit card only allows Credit payment method
export const CreditCardPaymentMethodOptions = [
  { label: 'Cartão Crédito', value: PaymentMethodEnum.Credit },
];

// Debit card allows all EXCEPT Credit
export const DebitCardPaymentMethodOptions = [
  { label: 'Cartão Débito', value: PaymentMethodEnum.Debit },
  { label: 'Pix', value: PaymentMethodEnum.Pix },
  { label: 'TED', value: PaymentMethodEnum.TED },
  { label: 'Boleto', value: PaymentMethodEnum.Boleto },
  { label: 'Dinheiro', value: PaymentMethodEnum.Cash },
  { label: 'Cheque', value: PaymentMethodEnum.Cheque },
  { label: 'Crypto Wallet', value: PaymentMethodEnum.CryptoWallet },
  { label: 'Voucher', value: PaymentMethodEnum.Voucher },
  { label: 'Outro', value: PaymentMethodEnum.Other },
];

// For backwards compatibility
export const PaymentMethodOptions = AllPaymentMethodOptions;
