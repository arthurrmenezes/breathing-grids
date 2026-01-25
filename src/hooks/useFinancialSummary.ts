import { useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/transactionService';
import type { FinancialSummary } from '@/types/transaction';

interface UseFinancialSummaryParams {
  cardId: string | undefined;
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
}

interface FinancialSummaryWithCardId extends FinancialSummary {
  cardId: string;
}

// Query key factory for financial summary
export const financialSummaryKeys = {
  all: ['financial-summary'] as const,
  byCard: (cardId: string) => ['financial-summary', cardId] as const,
  detail: (cardId: string, startDate?: string, endDate?: string) => 
    ['financial-summary', cardId, startDate, endDate] as const,
};

// Hook to invalidate all financial summary cache
export const useInvalidateFinancialSummary = () => {
  const queryClient = useQueryClient();
  
  return {
    // Invalidate all financial summary queries
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: financialSummaryKeys.all });
    },
    // Invalidate queries for a specific card
    invalidateByCard: (cardId: string) => {
      queryClient.invalidateQueries({ queryKey: financialSummaryKeys.byCard(cardId) });
    },
  };
};

export const useFinancialSummary = ({ 
  cardId, 
  startDate, 
  endDate, 
  enabled = true 
}: UseFinancialSummaryParams) => {
  return useQuery<FinancialSummaryWithCardId | null>({
    queryKey: financialSummaryKeys.detail(cardId || '', startDate, endDate),
    queryFn: async () => {
      if (!cardId) return null;
      
      const response = await transactionService.getFinancialSummary(cardId, startDate, endDate);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data ?? null;
    },
    enabled: enabled && !!cardId,
    staleTime: 30 * 1000, // 30 seconds - data considered fresh
    gcTime: 5 * 60 * 1000, // 5 minutes - cache retention
    refetchOnWindowFocus: false,
  });
};

// Hook for comparing current vs previous period
export const useFinancialSummaryComparison = ({
  cardId,
  currentStart,
  currentEnd,
  previousStart,
  previousEnd,
  enabled = true,
}: {
  cardId: string | undefined;
  currentStart?: string;
  currentEnd?: string;
  previousStart?: string;
  previousEnd?: string;
  enabled?: boolean;
}) => {
  const { invalidateAll } = useInvalidateFinancialSummary();

  const currentQuery = useFinancialSummary({
    cardId,
    startDate: currentStart,
    endDate: currentEnd,
    enabled,
  });

  const previousQuery = useFinancialSummary({
    cardId,
    startDate: previousStart,
    endDate: previousEnd,
    enabled,
  });

  return {
    current: currentQuery.data,
    previous: previousQuery.data,
    isLoading: currentQuery.isLoading || previousQuery.isLoading,
    isError: currentQuery.isError || previousQuery.isError,
    refetch: () => {
      currentQuery.refetch();
      previousQuery.refetch();
    },
    invalidateAll,
  };
};
