import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
  const [loadingCount, setLoadingCount] = useState(0);
  const location = useLocation();

  // Auto-trigger loading on route changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Brief loading state for route transitions

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const startLoading = useCallback(() => {
    setLoadingCount(prev => prev + 1);
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingCount(prev => {
      const newCount = Math.max(0, prev - 1);
      if (newCount === 0) {
        setIsLoading(false);
      }
      return newCount;
    });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
    if (!loading) {
      setLoadingCount(0);
    }
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, startLoading, stopLoading }}>
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
