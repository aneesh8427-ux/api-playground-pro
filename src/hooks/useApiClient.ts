import { useState, useCallback, useEffect } from 'react';
import {
  ApiRequest,
  ApiResponse,
  Collection,
  Environment,
  HistoryItem,
  KeyValuePair,
} from '@/types/api';
import {
  getAll,
  getById,
  save,
  remove,
  generateId,
  createDefaultRequest,
  createDefaultCollection,
  createDefaultEnvironment,
  initDB,
} from '@/lib/storage';

export function useApiClient() {
  const [requests, setRequests] = useState<Map<string, ApiRequest>>(new Map());
  const [collections, setCollections] = useState<Collection[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeRequest, setActiveRequest] = useState<ApiRequest | null>(null);
  const [activeResponse, setActiveResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeEnvironment, setActiveEnvironmentState] = useState<Environment | null>(null);
  const [globalVariables, setGlobalVariables] = useState<KeyValuePair[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from IndexedDB
  useEffect(() => {
    async function loadData() {
      try {
        await initDB();
        
        const [savedRequests, savedCollections, savedEnvironments, savedHistory] = await Promise.all([
          getAll('requests'),
          getAll('collections'),
          getAll('environments'),
          getAll('history'),
        ]);

        const requestMap = new Map<string, ApiRequest>();
        savedRequests.forEach((req) => requestMap.set(req.id, req));
        setRequests(requestMap);
        setCollections(savedCollections);
        setEnvironments(savedEnvironments);
        setHistory(savedHistory.sort((a, b) => b.timestamp - a.timestamp).slice(0, 100));

        const activeEnv = savedEnvironments.find((e) => e.isActive);
        if (activeEnv) {
          setActiveEnvironmentState(activeEnv);
        }

        // Load global variables from localStorage
        const savedGlobals = localStorage.getItem('api-client-globals');
        if (savedGlobals) {
          setGlobalVariables(JSON.parse(savedGlobals));
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to load data:', error);
        setIsInitialized(true);
      }
    }

    loadData();
  }, []);

  // Variable substitution
  const substituteVariables = useCallback(
    (text: string): string => {
      if (!text) return text;

      let result = text;
      const variableRegex = /\{\{([^}]+)\}\}/g;

      result = result.replace(variableRegex, (match, varName) => {
        const trimmedName = varName.trim();

        // Check request-level variables (from pre-request script context)
        // Check environment variables
        if (activeEnvironment) {
          const envVar = activeEnvironment.variables.find(
            (v) => v.key === trimmedName && v.enabled
          );
          if (envVar) return envVar.value;
        }

        // Check global variables
        const globalVar = globalVariables.find(
          (v) => v.key === trimmedName && v.enabled
        );
        if (globalVar) return globalVar.value;

        return match; // Return original if not found
      });

      return result;
    },
    [activeEnvironment, globalVariables]
  );

  // Request operations
  const createRequest = useCallback(async (collectionId?: string): Promise<ApiRequest> => {
    const request = createDefaultRequest();
    
    await save('requests', request);
    setRequests((prev) => new Map(prev).set(request.id, request));

    if (collectionId) {
      const collection = collections.find((c) => c.id === collectionId);
      if (collection) {
        const updatedCollection = {
          ...collection,
          requests: [...collection.requests, request.id],
          updatedAt: Date.now(),
        };
        await save('collections', updatedCollection);
        setCollections((prev) =>
          prev.map((c) => (c.id === collectionId ? updatedCollection : c))
        );
      }
    }

    return request;
  }, [collections]);

  const updateRequest = useCallback(async (request: ApiRequest) => {
    const updated = { ...request, updatedAt: Date.now() };
    await save('requests', updated);
    setRequests((prev) => new Map(prev).set(updated.id, updated));
    if (activeRequest?.id === request.id) {
      setActiveRequest(updated);
    }
  }, [activeRequest]);

  const deleteRequest = useCallback(async (requestId: string) => {
    await remove('requests', requestId);
    setRequests((prev) => {
      const next = new Map(prev);
      next.delete(requestId);
      return next;
    });

    // Remove from collections
    for (const collection of collections) {
      if (collection.requests.includes(requestId)) {
        const updatedCollection = {
          ...collection,
          requests: collection.requests.filter((id) => id !== requestId),
          updatedAt: Date.now(),
        };
        await save('collections', updatedCollection);
        setCollections((prev) =>
          prev.map((c) => (c.id === collection.id ? updatedCollection : c))
        );
      }
    }

    if (activeRequest?.id === requestId) {
      setActiveRequest(null);
      setActiveResponse(null);
    }
  }, [activeRequest, collections]);

  const duplicateRequest = useCallback(async (requestId: string): Promise<ApiRequest | null> => {
    const original = requests.get(requestId);
    if (!original) return null;

    const duplicate: ApiRequest = {
      ...original,
      id: generateId(),
      name: `${original.name} (copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await save('requests', duplicate);
    setRequests((prev) => new Map(prev).set(duplicate.id, duplicate));

    return duplicate;
  }, [requests]);

  // Collection operations
  const createCollection = useCallback(async (name?: string): Promise<Collection> => {
    const collection = createDefaultCollection(name);
    await save('collections', collection);
    setCollections((prev) => [...prev, collection]);
    return collection;
  }, []);

  const updateCollection = useCallback(async (collection: Collection) => {
    const updated = { ...collection, updatedAt: Date.now() };
    await save('collections', updated);
    setCollections((prev) =>
      prev.map((c) => (c.id === collection.id ? updated : c))
    );
  }, []);

  const deleteCollection = useCallback(async (collectionId: string) => {
    const collection = collections.find((c) => c.id === collectionId);
    if (!collection) return;

    // Delete all requests in the collection
    for (const requestId of collection.requests) {
      await remove('requests', requestId);
      setRequests((prev) => {
        const next = new Map(prev);
        next.delete(requestId);
        return next;
      });
    }

    await remove('collections', collectionId);
    setCollections((prev) => prev.filter((c) => c.id !== collectionId));
  }, [collections]);

  // Environment operations
  const createEnvironment = useCallback(async (name?: string): Promise<Environment> => {
    const environment = createDefaultEnvironment(name);
    await save('environments', environment);
    setEnvironments((prev) => [...prev, environment]);
    return environment;
  }, []);

  const updateEnvironment = useCallback(async (environment: Environment) => {
    await save('environments', environment);
    setEnvironments((prev) =>
      prev.map((e) => (e.id === environment.id ? environment : e))
    );
    if (activeEnvironment?.id === environment.id) {
      setActiveEnvironmentState(environment);
    }
  }, [activeEnvironment]);

  const setActiveEnvironment = useCallback(async (environmentId: string | null) => {
    // Deactivate all environments
    for (const env of environments) {
      if (env.isActive) {
        const updated = { ...env, isActive: false };
        await save('environments', updated);
      }
    }

    if (environmentId) {
      const env = environments.find((e) => e.id === environmentId);
      if (env) {
        const updated = { ...env, isActive: true };
        await save('environments', updated);
        setActiveEnvironmentState(updated);
        setEnvironments((prev) =>
          prev.map((e) => ({
            ...e,
            isActive: e.id === environmentId,
          }))
        );
      }
    } else {
      setActiveEnvironmentState(null);
      setEnvironments((prev) =>
        prev.map((e) => ({ ...e, isActive: false }))
      );
    }
  }, [environments]);

  const deleteEnvironment = useCallback(async (environmentId: string) => {
    await remove('environments', environmentId);
    setEnvironments((prev) => prev.filter((e) => e.id !== environmentId));
    if (activeEnvironment?.id === environmentId) {
      setActiveEnvironmentState(null);
    }
  }, [activeEnvironment]);

  // Global variables
  const updateGlobalVariables = useCallback((variables: KeyValuePair[]) => {
    setGlobalVariables(variables);
    localStorage.setItem('api-client-globals', JSON.stringify(variables));
  }, []);

  // Send request
  const sendRequest = useCallback(async (request: ApiRequest): Promise<ApiResponse> => {
    setIsLoading(true);
    const startTime = performance.now();

    try {
      // Build URL with params
      let url = substituteVariables(request.url);
      const enabledParams = request.params.filter((p) => p.enabled && p.key);
      if (enabledParams.length > 0) {
        const searchParams = new URLSearchParams();
        enabledParams.forEach((p) => {
          searchParams.append(
            substituteVariables(p.key),
            substituteVariables(p.value)
          );
        });
        url += (url.includes('?') ? '&' : '?') + searchParams.toString();
      }

      // Build headers
      const headers: Record<string, string> = {};
      request.headers
        .filter((h) => h.enabled && h.key)
        .forEach((h) => {
          headers[substituteVariables(h.key)] = substituteVariables(h.value);
        });

      // Add auth headers
      if (request.auth.type === 'bearer' && request.auth.bearer?.token) {
        headers['Authorization'] = `Bearer ${substituteVariables(request.auth.bearer.token)}`;
      } else if (request.auth.type === 'basic' && request.auth.basic) {
        const credentials = btoa(
          `${substituteVariables(request.auth.basic.username)}:${substituteVariables(request.auth.basic.password)}`
        );
        headers['Authorization'] = `Basic ${credentials}`;
      } else if (request.auth.type === 'apiKey' && request.auth.apiKey) {
        if (request.auth.apiKey.addTo === 'header') {
          headers[substituteVariables(request.auth.apiKey.key)] = substituteVariables(
            request.auth.apiKey.value
          );
        }
      }

      // Build body
      let body: string | FormData | undefined;
      if (request.method !== 'GET' && request.body.type !== 'none') {
        if (request.body.type === 'json' && request.body.raw) {
          headers['Content-Type'] = 'application/json';
          body = substituteVariables(request.body.raw);
        } else if (request.body.type === 'raw' && request.body.raw) {
          body = substituteVariables(request.body.raw);
        } else if (request.body.type === 'form-data' && request.body.formData) {
          const formData = new FormData();
          request.body.formData
            .filter((f) => f.enabled && f.key)
            .forEach((f) => {
              formData.append(
                substituteVariables(f.key),
                substituteVariables(f.value)
              );
            });
          body = formData;
        } else if (request.body.type === 'x-www-form-urlencoded' && request.body.urlencoded) {
          headers['Content-Type'] = 'application/x-www-form-urlencoded';
          const params = new URLSearchParams();
          request.body.urlencoded
            .filter((f) => f.enabled && f.key)
            .forEach((f) => {
              params.append(
                substituteVariables(f.key),
                substituteVariables(f.value)
              );
            });
          body = params.toString();
        }
      }

      const fetchResponse = await fetch(url, {
        method: request.method,
        headers,
        body,
      });

      const endTime = performance.now();
      const responseText = await fetchResponse.text();

      const responseHeaders: Record<string, string> = {};
      fetchResponse.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const response: ApiResponse = {
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        headers: responseHeaders,
        body: responseText,
        time: Math.round(endTime - startTime),
        size: new Blob([responseText]).size,
      };

      setActiveResponse(response);

      // Add to history
      const historyItem: HistoryItem = {
        id: generateId(),
        request: { ...request },
        response,
        timestamp: Date.now(),
      };
      await save('history', historyItem);
      setHistory((prev) => [historyItem, ...prev].slice(0, 100));

      return response;
    } catch (error) {
      const endTime = performance.now();
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      const response: ApiResponse = {
        status: 0,
        statusText: 'Error',
        headers: {},
        body: JSON.stringify({ error: errorMessage }, null, 2),
        time: Math.round(endTime - startTime),
        size: 0,
      };

      setActiveResponse(response);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, [substituteVariables]);

  // Clear history
  const clearHistory = useCallback(async () => {
    for (const item of history) {
      await remove('history', item.id);
    }
    setHistory([]);
  }, [history]);

  return {
    // State
    requests,
    collections,
    environments,
    history,
    activeRequest,
    activeResponse,
    isLoading,
    activeEnvironment,
    globalVariables,
    isInitialized,

    // Request operations
    setActiveRequest,
    createRequest,
    updateRequest,
    deleteRequest,
    duplicateRequest,
    sendRequest,

    // Collection operations
    createCollection,
    updateCollection,
    deleteCollection,

    // Environment operations
    createEnvironment,
    updateEnvironment,
    setActiveEnvironment,
    deleteEnvironment,

    // Global variables
    updateGlobalVariables,

    // History
    clearHistory,

    // Helpers
    substituteVariables,
  };
}
