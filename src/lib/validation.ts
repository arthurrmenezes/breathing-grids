// Transaction and Installment Validation Rules
// These mirror backend validation without exposing internal details

export interface ValidationError {
  field: string;
  message: string;
}

export interface TransactionValidationInput {
  title: string;
  amount: number; // in cents
  date: string; // YYYY-MM-DD format
  status: string; // 'Pago' | 'Pendente' | 'Atrasado'
  description?: string;
  destination?: string;
}

export interface InstallmentValidationInput {
  totalInstallments: number;
  totalAmount: number; // in cents
  firstPaymentDate: string; // YYYY-MM-DD format
}

// Get today's date in YYYY-MM-DD format (local timezone)
const getToday = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Parse date string to Date object at noon to avoid timezone issues
const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
};

// Check if date is in the future (after today)
const isFutureDate = (dateStr: string): boolean => {
  const date = parseDate(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date >= tomorrow;
};

// Check if date is in the past (before today)
const isPastDate = (dateStr: string): boolean => {
  const date = parseDate(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

// Check if date is more than 100 years in the past
const isDateTooOld = (dateStr: string): boolean => {
  const date = parseDate(dateStr);
  const hundredYearsAgo = new Date();
  hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
  return date < hundredYearsAgo;
};

/**
 * Validates transaction data according to business rules
 * Returns array of validation errors (empty if valid)
 */
export const validateTransaction = (input: TransactionValidationInput): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Title validation
  if (!input.title || input.title.trim().length === 0) {
    errors.push({
      field: 'title',
      message: 'O título é obrigatório.',
    });
  } else if (input.title.length > 50) {
    errors.push({
      field: 'title',
      message: 'O título deve ter no máximo 50 caracteres.',
    });
  }

  // Amount validation (input is in cents, convert to actual value for check)
  if (input.amount <= 0) {
    errors.push({
      field: 'amount',
      message: 'O valor deve ser maior que zero.',
    });
  }

  // Description validation (optional but has max length)
  if (input.description && input.description.trim().length > 300) {
    errors.push({
      field: 'description',
      message: 'A descrição deve ter no máximo 300 caracteres.',
    });
  }

  // Destination validation (optional but has max length)
  if (input.destination && input.destination.trim().length > 50) {
    errors.push({
      field: 'destination',
      message: 'O destino/origem deve ter no máximo 50 caracteres.',
    });
  }

  // Date + Status validation rules
  if (input.date) {
    // Future transaction cannot be Paid or Overdue
    if (isFutureDate(input.date)) {
      if (input.status === 'Pago' || input.status === 'Atrasado') {
        errors.push({
          field: 'status',
          message: `Uma transação futura não pode ter o status "${input.status}".`,
        });
      }
    }

    // Past transaction cannot be Pending
    if (isPastDate(input.date)) {
      if (input.status === 'Pendente') {
        errors.push({
          field: 'status',
          message: 'Uma transação passada não pode ter o status "Pendente".',
        });
      }
    }
  }

  return errors;
};

/**
 * Validates installment data according to business rules
 * Returns array of validation errors (empty if valid)
 */
export const validateInstallment = (input: InstallmentValidationInput): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Total installments validation (2-480)
  if (input.totalInstallments <= 1) {
    errors.push({
      field: 'totalInstallments',
      message: 'O número de parcelas deve ser pelo menos 2.',
    });
  } else if (input.totalInstallments > 480) {
    errors.push({
      field: 'totalInstallments',
      message: 'O número de parcelas deve ser no máximo 480.',
    });
  }

  // Total amount validation
  if (input.totalAmount <= 0) {
    errors.push({
      field: 'totalAmount',
      message: 'O valor total deve ser maior que zero.',
    });
  }

  // First payment date validation (not more than 100 years in the past)
  if (input.firstPaymentDate && isDateTooOld(input.firstPaymentDate)) {
    errors.push({
      field: 'firstPaymentDate',
      message: 'A data de início é inválida.',
    });
  }

  return errors;
};

/**
 * Gets a single error message for display
 * Prioritizes the first error found
 */
export const getFirstValidationError = (errors: ValidationError[]): string | null => {
  return errors.length > 0 ? errors[0].message : null;
};

/**
 * Gets all error messages as a formatted string
 */
export const getAllValidationErrors = (errors: ValidationError[]): string => {
  return errors.map(e => e.message).join(' ');
};

/**
 * Check if a specific field has an error
 */
export const hasFieldError = (errors: ValidationError[], field: string): boolean => {
  return errors.some(e => e.field === field);
};

/**
 * Get error message for a specific field
 */
export const getFieldError = (errors: ValidationError[], field: string): string | null => {
  const error = errors.find(e => e.field === field);
  return error ? error.message : null;
};
