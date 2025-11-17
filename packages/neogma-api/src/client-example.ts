// Example client usage with basic fetch
// You can use these examples in your frontend application

const API_BASE_URL = "http://localhost:3000/api";

// Type definitions (you can export these from your API)
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface CreateUserInput {
  name: string;
  email: string;
}

interface UpdateUserInput {
  name?: string;
  email?: string;
}

// API Client functions
export const userApi = {
  // Create a new user
  async create(data: CreateUserInput): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create user");
    }

    return response.json();
  },

  // Get user by ID
  async getById(id: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch user");
    }

    return response.json();
  },

  // List all users
  async list(options?: { limit?: number; offset?: number }): Promise<User[]> {
    const params = new URLSearchParams();
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.offset) params.append("offset", options.offset.toString());

    const url = `${API_BASE_URL}/users${params.toString() ? `?${params}` : ""}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch users");
    }

    return response.json();
  },

  // Update user
  async update(id: string, data: UpdateUserInput): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update user");
    }

    return response.json();
  },

  // Delete user
  async delete(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete user");
    }

    return response.json();
  },
};

// Example usage:
/*
// Create a user
const newUser = await userApi.create({
  name: "John Doe",
  email: "john@example.com",
});
console.log("Created:", newUser);

// Get user by ID
const user = await userApi.getById(newUser.id);
console.log("Fetched:", user);

// List users
const users = await userApi.list({ limit: 10, offset: 0 });
console.log("All users:", users);

// Update user
const updated = await userApi.update(newUser.id, {
  name: "Jane Doe",
});
console.log("Updated:", updated);

// Delete user
await userApi.delete(newUser.id);
console.log("Deleted successfully");
*/
