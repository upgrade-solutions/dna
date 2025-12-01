/**
 * Custom React hooks for API calls
 * Provides a simple alternative to React Query
 */

import { useState, useEffect, useCallback } from 'react';

interface UseQueryResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => void;
}

interface UseMutationResult<TData, TVariables> {
  data: TData | null;
  error: Error | null;
  isLoading: boolean;
  mutate: (variables: TVariables) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for GET requests (queries)
 */
export function useQuery<T>(
  queryFn: () => Promise<T>,
  options?: {
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(0);

  const enabled = options?.enabled !== false;

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    queryFn()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          options?.onSuccess?.(result);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          options?.onError?.(err);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [shouldFetch, enabled]);

  const refetch = useCallback(() => {
    setShouldFetch((prev) => prev + 1);
  }, []);

  return { data, error, isLoading, refetch };
}

/**
 * Hook for POST/PUT/DELETE requests (mutations)
 */
export function useMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
  }
): UseMutationResult<TData, TVariables> {
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mutate = useCallback(
    async (variables: TVariables) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await mutationFn(variables);
        setData(result);
        options?.onSuccess?.(result, variables);
      } catch (err) {
        const error = err as Error;
        setError(error);
        options?.onError?.(error, variables);
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, error, isLoading, mutate, reset };
}
