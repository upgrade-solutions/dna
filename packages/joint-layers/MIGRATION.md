# Migration from TRPC to REST API

This package has been migrated from TRPC to a simpler REST API architecture using basic fetch.

## What Changed

### Removed Dependencies (can be uninstalled if desired)
- `@trpc/client`
- `@trpc/react-query`
- `@trpc/server`
- `@tanstack/react-query`

### New Files
- `src/services/api-client.ts` - REST API client using fetch
- `src/hooks/useApi.ts` - Simple React hooks for queries and mutations

### Modified Files
- `src/components/TRPCExample.tsx` - Now uses REST API (exports both `APIExample` and `TRPCExample` for compatibility)
- `src/App.tsx` - Removed TRPCProvider wrapper

### Removed Files (no longer needed)
- `src/services/trpc-provider.tsx`
- `src/services/trpc-client.ts`
- `src/services/trpc-types.ts`

## Configuration

Create a `.env` file in the root of the package:

```env
REACT_APP_API_URL=http://localhost:3000/api
```

## Usage

### API Client

```typescript
import { api } from './services/api-client';

// Create a user
const user = await api.users.create({
  name: 'John Doe',
  email: 'john@example.com',
});

// Get all users
const users = await api.users.list({ limit: 10, offset: 0 });

// Get user by ID
const user = await api.users.getById(userId);

// Update user
const updated = await api.users.update(userId, { name: 'Jane Doe' });

// Delete user
await api.users.delete(userId);
```

### React Hooks

```typescript
import { useQuery, useMutation } from './hooks/useApi';
import { api } from './services/api-client';

function MyComponent() {
  // Query
  const { data, error, isLoading, refetch } = useQuery(
    () => api.users.list({ limit: 10 }),
    {
      onSuccess: (data) => console.log('Loaded:', data),
      onError: (error) => console.error('Error:', error),
    }
  );

  // Mutation
  const { mutate, isLoading: creating } = useMutation(
    (userData) => api.users.create(userData),
    {
      onSuccess: (newUser) => {
        console.log('Created:', newUser);
        refetch(); // Refresh the list
      },
    }
  );

  return (
    <div>
      <button onClick={() => mutate({ name: 'Test', email: 'test@example.com' })}>
        Create User
      </button>
      {isLoading && <p>Loading...</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

## Benefits

1. **Simpler** - No complex TRPC setup or type generation
2. **Standard** - Uses standard REST conventions everyone knows
3. **Lighter** - Fewer dependencies to maintain
4. **Flexible** - Easy to add custom headers, authentication, etc.
5. **Debuggable** - Easy to inspect in browser DevTools

## Optional Cleanup

To remove unused TRPC dependencies:

```bash
npm uninstall @trpc/client @trpc/react-query @trpc/server @tanstack/react-query
```

You can also delete the old TRPC service files:
- `src/services/trpc-provider.tsx`
- `src/services/trpc-client.ts`
- `src/services/trpc-types.ts`
