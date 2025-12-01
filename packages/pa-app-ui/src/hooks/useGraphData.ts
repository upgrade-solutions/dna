import { useState, useEffect, useCallback } from 'react';
import { api, GraphData } from '../services/api-client';
import exampleGraphJSON from '../joint-plus/config/example-graph.json';

interface UseGraphDataOptions {
  useFallback?: boolean;
  autoLoad?: boolean;
}

interface UseGraphDataReturn {
  data: GraphData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  saveGraph: (graphData: GraphData) => Promise<void>;
  seedGraph: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage graph data from the API
 * Falls back to example data if API is unavailable
 */
export const useGraphData = (
  options: UseGraphDataOptions = {}
): UseGraphDataReturn => {
  const { useFallback = true, autoLoad = true } = options;
  
  const [data, setData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchGraph = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const graphData = await api.graph.get();
      setData(graphData);
    } catch (err) {
      console.error('Failed to fetch graph data from API:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch graph data'));
      
      // Use fallback data if enabled
      if (useFallback) {
        console.log('Using fallback example graph data');
        setData(exampleGraphJSON as GraphData);
      }
    } finally {
      setIsLoading(false);
    }
  }, [useFallback]);

  const saveGraph = useCallback(async (graphData: GraphData) => {
    try {
      await api.graph.save(graphData);
      setData(graphData);
    } catch (err) {
      console.error('Failed to save graph data:', err);
      throw err;
    }
  }, []);

  const seedGraph = useCallback(async () => {
    try {
      await api.graph.seed();
      // Refetch the graph data after seeding
      await fetchGraph();
    } catch (err) {
      console.error('Failed to seed graph data:', err);
      throw err;
    }
  }, [fetchGraph]);

  useEffect(() => {
    if (autoLoad) {
      fetchGraph();
    }
  }, [autoLoad, fetchGraph]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchGraph,
    saveGraph,
    seedGraph,
  };
};
