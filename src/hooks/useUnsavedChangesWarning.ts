import { useEffect } from 'react';

export const useUnsavedChangesWarning = (hasUnsavedChanges: boolean, message?: string) => {
  const defaultMessage = 'Você tem dados não salvos. Tem certeza que deseja sair? Seus dados serão perdidos.';
  const warningMessage = message || defaultMessage;

  // Handle browser/tab close and page refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = warningMessage;
        return warningMessage;
      }
    };

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, warningMessage]);
};
