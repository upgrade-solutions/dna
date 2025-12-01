# Neogma API

This package is designed as a REST API that connects to Neo4j through Neogma.

## Technologies

* **TypeScript** - Strongly typed programming language
* **Deno** - Secure JavaScript/TypeScript runtime
* **Oak** - Middleware framework for Deno's http server
* **Neogma** - Neo4j OGM (Object-Graph Mapping)
* **Zod** - TypeScript-first schema validation

## Prerequisites

1. [Deno](https://deno.land/) installed (v1.40.0 or higher)
2. Neo4j database running (local or remote)

## Setup

### 1. Configure Environment Variables

Copy the example environment file and update with your Neo4j credentials:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3000
NEO4J_URL=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
```

### 2. Install Dependencies

Deno automatically handles dependencies from `deno.json`, but you can cache them:

```bash
deno cache src/main.ts
```

### 3. Start the Server

Development mode (with auto-reload):

```bash
deno task dev
```

Production mode:

```bash
deno task start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## Project Structure

```
neogma-api/
├── src/
│   ├── main.ts           # Server entry point with Oak
│   ├── db.ts             # Neo4j/Neogma connection
│   ├── client-example.ts # Client-side fetch examples
│   ├── models/           # Neogma models
│   │   └── User.ts
│   └── routers/          # Oak routers
│       └── user.router.ts
├── deno.json             # Deno configuration & dependencies
├── .env.example          # Environment variables template
├── .gitignore
└── README.md
```

## API Endpoints

### Health & Info

- `GET /` - API information
- `GET /api/health` - Health check

### User Endpoints

- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID
- `GET /api/users?limit=10&offset=0` - List users with pagination
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Usage Example

Using basic fetch (see `src/client-example.ts` for full examples):

```typescript
// Create a user
const response = await fetch('http://localhost:3000/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
  }),
});
const user = await response.json();

// Get all users
const usersResponse = await fetch('http://localhost:3000/api/users?limit=10&offset=0');
const users = await usersResponse.json();

// Get user by ID
const userResponse = await fetch(`http://localhost:3000/api/users/${user.id}`);
const fetchedUser = await userResponse.json();

// Update user
const updateResponse = await fetch(`http://localhost:3000/api/users/${user.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Jane Doe' }),
});
const updatedUser = await updateResponse.json();

// Delete user
const deleteResponse = await fetch(`http://localhost:3000/api/users/${user.id}`, {
  method: 'DELETE',
});
const deleteResult = await deleteResponse.json();
```

## Development

To add new models:

1. Create a model in `src/models/` with Zod schema and Neogma configuration
2. Create a router in `src/routers/` with Oak routes
3. Mount the router in `src/main.ts`

## License

ISC