import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const loadingCountRef = useRef(0);
  const location = useLocation();

  // Auto-trigger loading on route changes
  useEffect(() => {
    console.log('[LoadingContext] Route changed to:', location.pathname);
    setIsLoading(true);
    const timer = setTimeout(() => {
      console.log('[LoadingContext] Route transition complete');
      setIsLoading(false);
    }, 300); // Brief loading state for route transitions

    return () => {
      clearTimeout(timer);
    };
  }, [location.pathname]);

  const startLoading = useCallback(() => {
    loadingCountRef.current += 1;
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    loadingCountRef.current = Math.max(0, loadingCountRef.current - 1);
    if (loadingCountRef.current === 0) {
      setIsLoading(false);
    }
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
    if (!loading) {
      loadingCountRef.current = 0;
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isLoading,
    setLoading,
    startLoading,
    stopLoading
  }), [isLoading, setLoading, startLoading, stopLoading]);

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

// Hook to use loading state without throwing (for optional usage)
export function useLoadingOptional() {
  return useContext(LoadingContext);
}
