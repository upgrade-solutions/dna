import React from '../../$node_modules/@types/react/index.js';
import { api } from '../services/api-client';
import { useQuery, useMutation } from '../hooks/useApi';

/**
 * Example component demonstrating how to use the REST API client
 * with basic fetch in the joint-layers application.
 */
export const APIExample: React.FC = () => {
  // Example: Query health check
  const healthQuery = useQuery(
    () => api.health.check(),
    {
      onSuccess: (data) => console.log('Health check:', data),
    }
  );

  // Example: Query all users
  const usersQuery = useQuery(
    () => api.users.list({ limit: 10, offset: 0 }),
    {
      onSuccess: (data) => console.log('Users loaded:', data),
    }
  );

  // Example: Mutation to create a user
  const createUserMutation = useMutation(
    (data: { name: string; email: string }) => api.users.create(data),
    {
      onSuccess: (data) => {
        console.log('User created:', data);
        // Refetch users list to show the new user
        usersQuery.refetch();
      },
      onError: (error) => {
        console.error('Failed to create user:', error);
      },
    }
  );

  const handleCreateUser = () => {
    createUserMutation.mutate({
      name: 'John Doe',
      email: `john.doe.${Date.now()}@example.com`,
    });
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#ffffff', color: '#000000', minHeight: '100vh' }}>
      <h2 style={{ color: '#000000' }}>REST API Client Examples</h2>

      {/* Health Check */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#000000' }}>Health Check</h3>
        {healthQuery.isLoading && <p style={{ color: '#000000' }}>Loading...</p>}
        {healthQuery.error && <p style={{ color: 'red' }}>Error: {healthQuery.error.message}</p>}
        {healthQuery.data && (
          <pre style={{ background: '#f5f5f5', color: '#000000', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}>
            {JSON.stringify(healthQuery.data, null, 2)}
          </pre>
        )}
        <button onClick={() => healthQuery.refetch()} style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}>
          Refresh Health
        </button>
      </div>

      {/* All Users */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#000000' }}>All Users</h3>
        {usersQuery.isLoading && <p style={{ color: '#000000' }}>Loading...</p>}
        {usersQuery.error && <p style={{ color: 'red' }}>Error: {usersQuery.error.message}</p>}
        {usersQuery.data && (
          <div>
            <p style={{ color: '#000000' }}>Found {usersQuery.data.length} user(s)</p>
            <pre style={{ background: '#f5f5f5', color: '#000000', padding: '10px', borderRadius: '4px', maxHeight: '300px', overflow: 'auto', border: '1px solid #ddd' }}>
              {JSON.stringify(usersQuery.data, null, 2)}
            </pre>
          </div>
        )}
        <button onClick={() => usersQuery.refetch()} style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}>
          Refresh Users
        </button>
      </div>

      {/* Create User */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#000000' }}>Create User</h3>
        <button 
          onClick={handleCreateUser} 
          disabled={createUserMutation.isLoading}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            cursor: createUserMutation.isLoading ? 'not-allowed' : 'pointer',
            opacity: createUserMutation.isLoading ? 0.6 : 1,
            backgroundColor: '#007bff',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          {createUserMutation.isLoading ? 'Creating...' : 'Create Random User'}
        </button>
        {createUserMutation.error && (
          <p style={{ color: 'red' }}>Error: {createUserMutation.error.message}</p>
        )}
        {createUserMutation.data && (
          <div>
            <p style={{ color: '#28a745' }}>✓ User created successfully!</p>
            <pre style={{ background: '#f5f5f5', color: '#000000', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}>
              {JSON.stringify(createUserMutation.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};


