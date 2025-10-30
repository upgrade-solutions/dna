# Logging Middleware

Comprehensive request and response logging middleware for the API Shell.

## Features

- **Automatic request/response logging** for all endpoints
- **Configurable log levels** (debug, info, warn, error)
- **Request tracking** with unique request IDs
- **Status-aware logging** (automatically adjusts level based on HTTP status)
- **Selective body/header logging** with truncation to prevent log bloat
- **Excluded path patterns** to skip logging for health checks, docs, etc.
- **Performance timing** for each request
- **Safe error handling** to avoid crashes during logging

## Configuration

The logging middleware can be configured via environment variables or directly:

### Environment Variables

```bash
# Log level: debug | info | warn | error (default: info)
LOG_LEVEL=info

# Include request/response bodies in logs (default: false)
LOG_INCLUDE_BODIES=true

# Include request/response headers in logs (default: false)
LOG_INCLUDE_HEADERS=true
```

### Programmatic Configuration

```typescript
import { createLoggingMiddleware } from "./core/middleware/logging.ts";

const logger = createLoggingMiddleware({
  level: "debug",
  includeBody: true,
  includeHeaders: true,
  includeResponse: true,
  excludePaths: ["/health", "/docs", "/openapi.json", "/openapi.yaml"],
  maxBodySize: 2048,
});

app.use(logger.middleware());
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | true | Enable/disable logging |
| `level` | string | "info" | Minimum log level: debug, info, warn, error |
| `includeHeaders` | boolean | false | Include request/response headers in logs |
| `includeBody` | boolean | false | Include request/response bodies in logs |
| `includeResponse` | boolean | true | Include response data in logs |
| `excludePaths` | string[] | ["/health", "/docs", ...] | Paths to exclude from logging (supports wildcards) |
| `maxBodySize` | number | 1024 | Maximum size of body to log (bytes) |

## Log Levels

- **debug**: Detailed request/response information (including bodies, headers)
- **info**: Standard request/response logging
- **warn**: HTTP 4xx status codes
- **error**: HTTP 5xx status codes and exceptions

## Output Examples

### Info Level Request
```
[2025-10-30T12:00:00.000Z] [INFO] [req_1701234000000_1] GET /api/users - 200 (45ms) - GET /api/users completed
```

### Debug Level with Details
```
[2025-10-30T12:00:00.000Z] [DEBUG] [req_1701234000000_1] GET /api/users - Incoming request
{
  query: { page: '1', limit: '10' }
}
```

### Error Response
```
[2025-10-30T12:00:00.000Z] [ERROR] [req_1701234000000_2] POST /api/users - 400 (12ms) - POST /api/users completed
{
  body: '{"errors":["Email already exists"]}'
}
```

## Usage in Middleware Chain

The logging middleware should be added early in your middleware chain to capture all requests:

```typescript
import { createLoggingMiddleware } from "./core/middleware/logging.ts";

const app = new Application();

// Add logging first to capture all requests
const logger = createLoggingMiddleware({
  level: process.env.LOG_LEVEL || "info",
});
app.use(logger.middleware());

// Then add other middleware
app.use(errorHandlingMiddleware);
app.use(authMiddleware);

// Finally add routes
app.use(router.routes());
```

## Request ID Tracking

Each request is assigned a unique request ID (`req_<timestamp>_<counter>`) which is included in all log entries for that request. This allows you to:

- Track a single request through multiple log entries
- Correlate logs across different services (if propagated)
- Debug complex request flows

## Performance Considerations

- Body logging is disabled by default to minimize overhead
- Bodies are automatically truncated to `maxBodySize` (default 1KB)
- Excluded paths skip all logging logic entirely
- Use `level: "warn"` or higher in production to reduce log volume

## Example: Production Configuration

```typescript
const prodLogger = createLoggingMiddleware({
  level: "warn", // Only log warnings and errors
  includeBody: false,
  includeHeaders: false,
  includeResponse: true,
  excludePaths: ["/health", "/docs", "/metrics"],
  maxBodySize: 512,
});

app.use(prodLogger.middleware());
```

## Example: Development Configuration

```typescript
const devLogger = createLoggingMiddleware({
  level: "debug", // Log everything
  includeBody: true,
  includeHeaders: true,
  includeResponse: true,
  excludePaths: ["/health", "/docs"],
  maxBodySize: 4096, // Larger buffer for debugging
});

app.use(devLogger.middleware());
```

## Sensitive Data Handling

The middleware automatically excludes the following headers from logging:
- `authorization`
- `cookie`
- `x-api-key`
- `x-auth-token`

This helps prevent accidental logging of sensitive credentials.

## Error Handling

The middleware is designed to be resilient:
- If body extraction fails, it logs a safe error message
- If logging throws an error, it's caught and doesn't break the request
- All errors during logging are re-thrown to allow proper error handling by other middleware
