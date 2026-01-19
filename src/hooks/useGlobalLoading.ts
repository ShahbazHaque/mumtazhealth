import { useEffect, useRef } from 'react';
import { useLoadingOptional } from '@/contexts/LoadingContext';

/**
 * Hook to automatically manage global loading state based on a loading boolean.
 * Integrates with the LoadingContext to show the global loading indicator.
 */
export function useGlobalLoading(isLoading: boolean) {
  const loadingContext = useLoadingOptional();
  const wasLoading = useRef(false);

  useEffect(() => {
    if (!loadingContext) return;

    if (isLoading && !wasLoading.current) {
      loadingContext.startLoading();
      wasLoading.current = true;
    } else if (!isLoading && wasLoading.current) {
      loadingContext.stopLoading();
      wasLoading.current = false;
    }

    return () => {
      if (wasLoading.current) {
        loadingContext.stopLoading();
        wasLoading.current = false;
      }
    };
  }, [isLoading, loadingContext]);
}

export default useGlobalLoading;
