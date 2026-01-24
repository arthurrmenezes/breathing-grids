// Card Service

import { api, ApiResponse } from './api';
import type { 
  Card,
  CreateCardInput, 
  UpdateCardInput, 
  CardsListResponse,
  GetCardsParams
} from '@/types/card';
import type { FinancialSummary } from '@/types/transaction';

const BASE_ENDPOINT = '/cards';

export const cardService = {
  /**
   * Create a new card
   */
  async create(data: CreateCardInput): Promise<ApiResponse<Card>> {
    return api.post<Card>(BASE_ENDPOINT, data);
  },

  /**
   * Get a card by ID
   */
  async getById(id: string): Promise<ApiResponse<Card>> {
    return api.get<Card>(`${BASE_ENDPOINT}/${id}`);
  },

  /**
   * Get all cards for the account with pagination and filters
   */
  async getAll(params?: GetCardsParams): Promise<ApiResponse<CardsListResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.cardType !== undefined) queryParams.append('cardType', params.cardType.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `${BASE_ENDPOINT}?${queryString}` : BASE_ENDPOINT;
    
    return api.get<CardsListResponse>(endpoint);
  },

  /**
   * Update a card
   */
  async update(id: string, data: UpdateCardInput): Promise<ApiResponse<Card>> {
    return api.patch<Card>(`${BASE_ENDPOINT}/${id}`, data);
  },

  /**
   * Delete a card
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`${BASE_ENDPOINT}/${id}`);
  },

  /**
   * Get financial summary for a card
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
};
