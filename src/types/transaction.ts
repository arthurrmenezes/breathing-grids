// Transaction Types

export interface TransactionInstallmentItem {
  id: string;
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
  installments: TransactionInstallmentItem[];
}

export interface Transaction {
  id: string;
  accountId: string;
  categoryId: string;
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

export interface UpdateTransactionInstallmentInput {
  totalInstallments?: number;
}

export interface UpdateTransactionInput {
  categoryId?: string;
  title?: string;
  description?: string;
  amount?: number;
  date?: string;
  transactionType?: number;
  paymentMethod?: number;
  status?: number;
  destination?: string;
  installment?: UpdateTransactionInstallmentInput;
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
  transactionType?: number;
  categoryId?: string;
  paymentMethod?: number;
  paymentStatus?: number;
  startDate?: string;
  endDate?: string;
  minValue?: number;
  maxValue?: number;
  textSearch?: string;
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
  CreditCard: 0,
  DebitCard: 1,
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
  'CreditCard': 'Cartão Crédito',
  'DebitCard': 'Cartão Débito',
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

// For select options in forms
export const PaymentMethodOptions = [
  { label: 'Cartão Crédito', value: PaymentMethodEnum.CreditCard },
  { label: 'Cartão Débito', value: PaymentMethodEnum.DebitCard },
  { label: 'Pix', value: PaymentMethodEnum.Pix },
  { label: 'TED', value: PaymentMethodEnum.TED },
  { label: 'Boleto', value: PaymentMethodEnum.Boleto },
  { label: 'Dinheiro', value: PaymentMethodEnum.Cash },
  { label: 'Cheque', value: PaymentMethodEnum.Cheque },
  { label: 'Crypto Wallet', value: PaymentMethodEnum.CryptoWallet },
  { label: 'Voucher', value: PaymentMethodEnum.Voucher },
  { label: 'Outro', value: PaymentMethodEnum.Other },
];
