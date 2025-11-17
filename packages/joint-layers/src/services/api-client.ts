/**
 * API Client for communicating with the Neogma REST API
 * Uses basic fetch for simplicity and reliability
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Type definitions
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}

// Graph data types
export interface GraphCell {
  type: string;
  id: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  attrs?: any;
  ports?: any;
  source?: any;
  target?: any;
  labels?: any[];
  z?: number;
  vertices?: any[];
}

export interface GraphData {
  cells: GraphCell[];
}

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// API Client
export const api = {
  // Health check
  health: {
    async check(): Promise<HealthResponse> {
      return fetchApi<HealthResponse>('/health');
    },
  },

  // User endpoints
  users: {
    async create(data: CreateUserInput): Promise<User> {
      return fetchApi<User>('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async getById(id: string): Promise<User> {
      return fetchApi<User>(`/users/${id}`);
    },

    async list(options?: { limit?: number; offset?: number }): Promise<User[]> {
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());
      
      const query = params.toString();
      return fetchApi<User[]>(`/users${query ? `?${query}` : ''}`);
    },

    async update(id: string, data: UpdateUserInput): Promise<User> {
      return fetchApi<User>(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    async delete(id: string): Promise<{ success: boolean }> {
      return fetchApi<{ success: boolean }>(`/users/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Graph endpoints
  graph: {
    async get(): Promise<GraphData> {
      return fetchApi<GraphData>('/graph');
    },

    async save(data: GraphData): Promise<{ success: boolean }> {
      return fetchApi<{ success: boolean }>('/graph', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async seed(): Promise<{ success: boolean; message: string }> {
      return fetchApi<{ success: boolean; message: string }>('/graph/seed', {
        method: 'POST',
      });
    },
  },
};
