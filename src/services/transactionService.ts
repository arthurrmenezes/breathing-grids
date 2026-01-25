// Transaction Service

import { api, ApiResponse } from './api';
import type { 
  Transaction,
  TransactionWithInstallment,
  CreateTransactionInput, 
  UpdateTransactionInput, 
  TransactionsListResponse,
  GetTransactionsParams,
  FinancialSummary
} from '@/types/transaction';

const BASE_ENDPOINT = '/transactions';

export const transactionService = {
  /**
   * Create a new transaction
   */
  async create(data: CreateTransactionInput): Promise<ApiResponse<TransactionWithInstallment>> {
    return api.post<TransactionWithInstallment>(BASE_ENDPOINT, data);
  },

  /**
   * Get a transaction by ID
   */
  async getById(id: string): Promise<ApiResponse<Transaction>> {
    return api.get<Transaction>(`${BASE_ENDPOINT}/${id}`);
  },

  /**
   * Get all transactions for the account with pagination and filters
   */
  async getAll(params?: GetTransactionsParams): Promise<ApiResponse<TransactionsListResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.cardId) queryParams.append('cardId', params.cardId);
    if (params?.transactionType !== undefined) queryParams.append('transactionType', params.transactionType.toString());
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.paymentMethod !== undefined) queryParams.append('paymentMethod', params.paymentMethod.toString());
    if (params?.paymentStatus !== undefined) queryParams.append('paymentStatus', params.paymentStatus.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.minValue !== undefined) queryParams.append('minValue', params.minValue.toString());
    if (params?.maxValue !== undefined) queryParams.append('maxValue', params.maxValue.toString());
    if (params?.textSearch) queryParams.append('textSearch', params.textSearch);
    if (params?.hasInstallment !== undefined) queryParams.append('hasInstallment', params.hasInstallment.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `${BASE_ENDPOINT}?${queryString}` : BASE_ENDPOINT;
    
    return api.get<TransactionsListResponse>(endpoint);
  },

  /**
   * Update a transaction
   */
  async update(id: string, data: UpdateTransactionInput): Promise<ApiResponse<Transaction>> {
    return api.patch<Transaction>(`${BASE_ENDPOINT}/${id}`, data);
  },

  /**
   * Delete a transaction
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`${BASE_ENDPOINT}/${id}`);
  },

  /**
   * Get financial summary for a card and date range
   */
  async getFinancialSummary(cardId: string, startDate?: string, endDate?: string): Promise<ApiResponse<FinancialSummary & { cardId: string }>> {
    const queryParams = new URLSearchParams();
    
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    
    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `${BASE_ENDPOINT}/financial-summary/${cardId}?${queryString}` 
      : `${BASE_ENDPOINT}/financial-summary/${cardId}`;
    
    return api.get<FinancialSummary & { cardId: string }>(endpoint);
  },

  /**
   * Get all transactions for a specific invoice
   */
  async getByInvoice(
    cardId: string, 
    invoiceId: string, 
    params?: { pageNumber?: number; pageSize?: number }
  ): Promise<ApiResponse<TransactionsListResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `${BASE_ENDPOINT}/${cardId}/${invoiceId}?${queryString}` 
      : `${BASE_ENDPOINT}/${cardId}/${invoiceId}`;
    
    return api.get<TransactionsListResponse>(endpoint);
  },
};
