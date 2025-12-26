// Transaction Types

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
  updatedAt?: string;
  createdAt: string;
}

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
  items: TransactionInstallmentItem[];
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
  totalIncome: number;
  totalExpense: number;
  balance: number;
  startDate: string;
  endDate: string;
}

// Enums for API
export const TransactionTypeEnum = {
  Receita: 0,
  Despesa: 1,
} as const;

export const PaymentMethodEnum = {
  Pix: 0,
  'Cartão Crédito': 1,
  'Cartão Débito': 2,
  'Débito Automático': 3,
  Transferência: 4,
  Boleto: 5,
  Dinheiro: 6,
} as const;

export const PaymentStatusEnum = {
  Pendente: 0,
  Pago: 1,
  Atrasado: 2,
} as const;

// Labels for display
export const TransactionTypeLabels: Record<string, string> = {
  'Income': 'Receita',
  'Expense': 'Despesa',
  'Receita': 'Receita',
  'Despesa': 'Despesa',
};

export const PaymentMethodLabels: Record<string, string> = {
  'Pix': 'Pix',
  'CreditCard': 'Cartão Crédito',
  'DebitCard': 'Cartão Débito',
  'AutomaticDebit': 'Débito Automático',
  'Transfer': 'Transferência',
  'BankSlip': 'Boleto',
  'Cash': 'Dinheiro',
};

export const PaymentStatusLabels: Record<string, string> = {
  'Pending': 'Pendente',
  'Paid': 'Pago',
  'Overdue': 'Atrasado',
};
