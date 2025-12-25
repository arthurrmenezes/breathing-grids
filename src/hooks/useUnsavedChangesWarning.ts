import { useEffect, useCallback } from 'react';
import { useBlocker } from 'react-router-dom';

export const useUnsavedChangesWarning = (hasUnsavedChanges: boolean, message?: string) => {
  const defaultMessage = 'Você tem dados não salvos. Tem certeza que deseja sair? Seus dados serão perdidos.';
  const warningMessage = message || defaultMessage;

  // Handle browser/tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = warningMessage;
        return warningMessage;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, warningMessage]);

  // Handle React Router navigation
  const blocker = useBlocker(
    useCallback(
      () => hasUnsavedChanges,
      [hasUnsavedChanges]
    )
  );

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const confirmLeave = window.confirm(warningMessage);
      if (confirmLeave) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker, warningMessage]);

  return blocker;
};
