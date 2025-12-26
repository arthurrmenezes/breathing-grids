// Category Service

import { api, ApiResponse } from './api';
import type { 
  Category, 
  CreateCategoryInput, 
  UpdateCategoryInput, 
  CategoriesListResponse,
  GetCategoriesParams 
} from '@/types/category';

const BASE_ENDPOINT = '/categories';

export const categoryService = {
  /**
   * Create a new category
   */
  async create(data: CreateCategoryInput): Promise<ApiResponse<Category>> {
    return api.post<Category>(BASE_ENDPOINT, data);
  },

  /**
   * Get a category by ID
   */
  async getById(id: string): Promise<ApiResponse<Category>> {
    return api.get<Category>(`${BASE_ENDPOINT}/${id}`);
  },

  /**
   * Get all categories for the account with pagination and filters
   */
  async getAll(params?: GetCategoriesParams): Promise<ApiResponse<CategoriesListResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.categoryType !== undefined) queryParams.append('categoryType', params.categoryType.toString());
    if (params?.textSearch) queryParams.append('textSearch', params.textSearch);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `${BASE_ENDPOINT}?${queryString}` : BASE_ENDPOINT;
    
    return api.get<CategoriesListResponse>(endpoint);
  },

  /**
   * Update a category
   */
  async update(id: string, data: UpdateCategoryInput): Promise<ApiResponse<Category>> {
    return api.patch<Category>(`${BASE_ENDPOINT}/${id}`, data);
  },

  /**
   * Delete a category
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return api.delete<void>(`${BASE_ENDPOINT}/${id}`);
  },
};
