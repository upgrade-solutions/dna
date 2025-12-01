/**
 * Type exports for consuming the neogma-api from other packages
 * This file provides type definitions for API inputs and outputs
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

export type HealthCheck = {
  status: string;
  timestamp: string;
};
