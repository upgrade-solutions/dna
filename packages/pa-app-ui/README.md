# Chatbot React Typescript

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Project setup

### `npm install`

## tRPC Client Integration

This application includes a tRPC client that connects to the neogma-api server for type-safe API communication.

### Configuration

The tRPC client is configured in `src/services/trpc-provider.tsx` and connects to: `http://localhost:3000/trpc`

### Usage Examples

#### Basic Query
```typescript
import { trpc } from '../services/trpc-client';

function MyComponent() {
  const { data, isLoading, error } = trpc.health.useQuery();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{JSON.stringify(data)}</div>;
}
```

#### Query with Parameters
```typescript
const { data } = trpc.findNodes.useQuery({
  label: 'User',
  limit: 10,
});
```

#### Mutation Example
```typescript
const mutation = trpc.createNode.useMutation({
  onSuccess: (data) => {
    console.log('Created:', data);
  },
});

const handleCreate = () => {
  mutation.mutate({
    label: 'User',
    properties: { name: 'John' },
  });
};
```

### Available Endpoints

- `health` - Health check query
- `dbInfo` - Get Neo4j database information
- `findNodes` - Find nodes by label
- `createNode` - Create a new node
- `user.getAll` - Get all users
- `user.getById` - Get user by ID
- `user.create` - Create a new user
- `user.update` - Update a user
- `user.delete` - Delete a user

See `src/components/TRPCExample.tsx` for more usage examples.

### Running with neogma-api

1. Start the neogma-api server:
   ```bash
   cd ../neogma-api
   deno task dev
   ```

2. Start this application:
   ```bash
   npm start
   ```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
