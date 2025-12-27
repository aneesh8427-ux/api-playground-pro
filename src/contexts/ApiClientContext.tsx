import React, { createContext, useContext, ReactNode } from 'react';
import { useApiClient } from '@/hooks/useApiClient';

type ApiClientContextType = ReturnType<typeof useApiClient>;

const ApiClientContext = createContext<ApiClientContextType | null>(null);

export function ApiClientProvider({ children }: { children: ReactNode }) {
  const apiClient = useApiClient();

  return (
    <ApiClientContext.Provider value={apiClient}>
      {children}
    </ApiClientContext.Provider>
  );
}

export function useApiClientContext() {
  const context = useContext(ApiClientContext);
  if (!context) {
    throw new Error('useApiClientContext must be used within ApiClientProvider');
  }
  return context;
}
