import { useState, useEffect, useCallback } from 'react';
import { cardService } from '@/services/cardService';
import { categoryService } from '@/services/categoryService';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingState {
  isLoading: boolean;
  needsOnboarding: boolean;
  hasCards: boolean;
  hasCategories: boolean;
}

const ONBOARDING_COMPLETED_KEY = 'tmoney_onboarding_completed';

export const useOnboarding = () => {
  const { isAuthenticated, user } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    isLoading: true,
    needsOnboarding: false,
    hasCards: false,
    hasCategories: false,
  });

  const checkOnboardingStatus = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setState(prev => ({ ...prev, isLoading: false, needsOnboarding: false }));
      return;
    }

    // Check if onboarding was already completed for this user
    const completedKey = `${ONBOARDING_COMPLETED_KEY}_${user.accountId}`;
    const isCompleted = localStorage.getItem(completedKey) === 'true';
    
    if (isCompleted) {
      setState({
        isLoading: false,
        needsOnboarding: false,
        hasCards: true,
        hasCategories: true,
      });
      return;
    }

    try {
      // Check cards and categories in parallel
      const [cardsResponse, categoriesResponse] = await Promise.all([
        cardService.getAll({ pageSize: 1 }),
        categoryService.getAll({ pageSize: 1 }),
      ]);

      const hasCards = (cardsResponse.data?.cards?.length ?? 0) > 0;
      const hasCategories = (categoriesResponse.data?.categories?.length ?? 0) > 0;

      // User needs onboarding if they have no cards AND no categories
      const needsOnboarding = !hasCards && !hasCategories;

      setState({
        isLoading: false,
        needsOnboarding,
        hasCards,
        hasCategories,
      });
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setState(prev => ({ ...prev, isLoading: false, needsOnboarding: false }));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  const completeOnboarding = useCallback(() => {
    if (user) {
      const completedKey = `${ONBOARDING_COMPLETED_KEY}_${user.accountId}`;
      localStorage.setItem(completedKey, 'true');
      setState(prev => ({ ...prev, needsOnboarding: false }));
    }
  }, [user]);

  const resetOnboarding = useCallback(() => {
    if (user) {
      const completedKey = `${ONBOARDING_COMPLETED_KEY}_${user.accountId}`;
      localStorage.removeItem(completedKey);
      setState(prev => ({ ...prev, needsOnboarding: true }));
    }
  }, [user]);

  const refreshOnboardingStatus = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }));
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  return {
    ...state,
    completeOnboarding,
    resetOnboarding,
    refreshOnboardingStatus,
  };
};
