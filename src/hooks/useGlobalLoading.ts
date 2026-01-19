import { useEffect, useRef } from 'react';
import { useLoadingOptional } from '@/contexts/LoadingContext';

/**
 * Hook to automatically manage global loading state based on a loading boolean.
 * Integrates with the LoadingContext to show the global loading indicator.
 */
export function useGlobalLoading(isLoading: boolean) {
  const loadingContext = useLoadingOptional();
  const wasLoadingRef = useRef(false);
  const hasCleanedUpRef = useRef(false);
  
  // Store stable references to avoid dependency issues
  const startLoadingRef = useRef(loadingContext?.startLoading);
  const stopLoadingRef = useRef(loadingContext?.stopLoading);
  
  // Update refs when context changes
  startLoadingRef.current = loadingContext?.startLoading;
  stopLoadingRef.current = loadingContext?.stopLoading;

  useEffect(() => {
    hasCleanedUpRef.current = false;
    
    if (!startLoadingRef.current || !stopLoadingRef.current) return;

    if (isLoading && !wasLoadingRef.current) {
      startLoadingRef.current();
      wasLoadingRef.current = true;
    } else if (!isLoading && wasLoadingRef.current) {
      stopLoadingRef.current();
      wasLoadingRef.current = false;
    }

    return () => {
      if (wasLoadingRef.current && !hasCleanedUpRef.current && stopLoadingRef.current) {
        stopLoadingRef.current();
        wasLoadingRef.current = false;
        hasCleanedUpRef.current = true;
      }
    };
  }, [isLoading]);
}

export default useGlobalLoading;
