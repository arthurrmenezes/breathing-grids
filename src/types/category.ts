// Category Types

export interface Category {
  id: string;
  title: string;
  type: string;
  accountId: string;
  isDefault: boolean;
  updatedAt?: string;
  createdAt: string;
}

export interface CreateCategoryInput {
  title: string;
  type: number; // 0 = Receita, 1 = Despesa, 2 = Ambos
}

export interface UpdateCategoryInput {
  newTitle?: string;
  newType?: number;
}

export interface CategoriesListResponse {
  totalCategories: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  categoryType?: string;
  categories: Category[];
}

export interface GetCategoriesParams {
  pageNumber?: number;
  pageSize?: number;
  categoryType?: number;
  textSearch?: string;
}

// Category type enum values for API (matching backend: Expense=0, Income=1, Both=2)
export const CategoryTypeEnum = {
  Despesa: 0,
  Receita: 1,
  Ambos: 2,
} as const;

export const CategoryTypeLabels: Record<string, string> = {
  'Income': 'Receita',
  'Expense': 'Despesa',
  'Both': 'Ambos',
  'Receita': 'Receita',
  'Despesa': 'Despesa',
  'Ambos': 'Ambos',
};
