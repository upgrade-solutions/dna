/**
 * Type definitions for cross-package compatibility
 * This provides REST API type definitions
 */

// User API types
export type CreateUserInput = {
  name: string;
  email: string;
};

export type UpdateUserInput = {
  name?: string;
  email?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type DeleteResponse = {
  success: boolean;
};

// Health check type
export type HealthCheck = {
  status: string;
  timestamp: string;
};
