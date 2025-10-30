# Structured JSON Logging

Structured JSON logging middleware for integration with external logging services like Datadog, ELK Stack, CloudWatch, etc.

## Overview

The structured logging middleware outputs logs in JSON format (JSONL - one JSON object per line), making them easily parseable by logging services and enabling advanced filtering, searching, and analytics.

## Key Features

✅ **JSON Format** - Logs output as valid JSON objects (one per line)  
✅ **Service Metadata** - Includes service name, environment, and user ID  
✅ **Request Tracking** - Unique request IDs for correlation  
✅ **Performance Metrics** - Duration and status tracking  
✅ **Error Details** - Stack traces and error messages  
✅ **File & Console Output** - Write to both console and file simultaneously  
✅ **Color-Coded Console** - DEBUG (cyan), INFO (green), WARN (yellow), ERROR (red)  
✅ **Log Level Filtering** - Only output logs at specified level or higher  

## Configuration

### Environment Variables

```bash
# Enable structured logging
ENABLE_STRUCTURED_LOGGING=true

# Log level: DEBUG, INFO, WARN, ERROR
LOG_LEVEL=INFO

# Output to console
LOG_TO_CONSOLE=true

# Output to file
LOG_TO_FILE=true

# Log file path (default: ./logs/api-shell.jsonl)
LOG_FILE_PATH=./logs/api-shell.jsonl

# Include request/response details
LOG_INCLUDE_BODIES=true

# Environment name
ENVIRONMENT=production
```

### Programmatic Configuration

```typescript
import { createStructuredLoggingMiddleware } from "./core/middleware/structured-logging.ts";

const jsonLogger = createStructuredLoggingMiddleware({
  service: "api-shell",              // Required: service name
  environment: "production",          // Environment: production, staging, development
  level: "INFO",                      // Log level: DEBUG, INFO, WARN, ERROR
  includeDetails: true,               // Include request/response bodies
  outputToConsole: true,              // Output to console
  outputToFile: true,                 // Output to file
  logFilePath: "./logs/api-shell.jsonl", // File path
  excludePaths: ["/health", "/docs"], // Paths to exclude
  maxBodySize: 2048,                  // Max body size to log
});

app.use(jsonLogger.middleware());
```

## Log Entry Structure

```json
{
  "timestamp": "2025-10-30T12:00:00.123Z",
  "level": "INFO",
  "requestId": "req_1701234000000_1",
  "method": "GET",
  "path": "/api/users",
  "status": 200,
  "duration": 45,
  "message": "GET /api/users - 200",
  "service": "api-shell",
  "environment": "production",
  "userId": "user_123",
  "details": {
    "query": { "page": "1", "limit": "10" },
    "body": "{...}"
  }
}
```

### Log Entry Fields

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | string | ISO 8601 timestamp |
| `level` | string | Log level: DEBUG, INFO, WARN, ERROR |
| `requestId` | string | Unique request identifier for correlation |
| `method` | string | HTTP method (GET, POST, etc.) |
| `path` | string | Request path |
| `status` | number | HTTP status code (optional) |
| `duration` | number | Request duration in milliseconds (optional) |
| `message` | string | Log message |
| `service` | string | Service name |
| `environment` | string | Environment name |
| `userId` | string | User ID (optional, if available) |
| `details` | object | Additional details (optional) |
| `error` | object | Error details (optional) |

## Log Levels

| Level | Priority | Use Case |
|-------|----------|----------|
| DEBUG | 0 | Detailed information for debugging |
| INFO | 1 | General informational messages |
| WARN | 2 | Warning messages (4xx HTTP responses) |
| ERROR | 3 | Error messages (5xx HTTP responses, exceptions) |

Only logs at the configured level or higher are output.

## Usage Examples

### Basic Setup

```typescript
const jsonLogger = createStructuredLoggingMiddleware({
  service: "api-shell",
  environment: "production",
  level: "INFO",
  outputToConsole: true,
  outputToFile: false,
});

app.use(jsonLogger.middleware());
```

### With File Logging

```typescript
const jsonLogger = createStructuredLoggingMiddleware({
  service: "api-shell",
  environment: "production",
  level: "INFO",
  outputToConsole: true,
  outputToFile: true,
  logFilePath: "./logs/api-shell.jsonl",
});

app.use(jsonLogger.middleware());

// Clean up on shutdown
Deno.addEventListener("unload", () => {
  jsonLogger.close();
});
```

### Manual Logging

```typescript
const jsonLogger = createStructuredLoggingMiddleware({
  service: "api-shell",
  environment: "production",
});

// Log custom events
jsonLogger.log("INFO", "User registration started", {
  email: user.email,
  source: "signup_form",
}, requestId, userId);

jsonLogger.log("ERROR", "Payment processing failed", {
  orderId: order.id,
  amount: order.total,
  reason: "Card declined",
}, requestId, userId);
```

### Environment-Based Configuration

```bash
# Development
ENABLE_STRUCTURED_LOGGING=true
LOG_LEVEL=DEBUG
LOG_INCLUDE_BODIES=true
LOG_TO_FILE=false

# Production
ENABLE_STRUCTURED_LOGGING=true
LOG_LEVEL=WARN
LOG_INCLUDE_BODIES=false
LOG_TO_FILE=true
LOG_FILE_PATH=/var/log/api-shell.jsonl
```

## Console Output Examples

### Info Level
```
{"timestamp":"2025-10-30T12:00:00.123Z","level":"INFO","requestId":"req_1701234000000_1","method":"GET","path":"/api/users","status":200,"duration":45,"message":"GET /api/users - 200","service":"api-shell","environment":"production"}
```

### Error Level
```
{"timestamp":"2025-10-30T12:00:00.456Z","level":"ERROR","requestId":"req_1701234000000_2","method":"POST","path":"/api/orders","duration":234,"message":"Request processing failed","service":"api-shell","environment":"production","error":{"message":"Database connection failed","stack":"Error: Connection timeout..."}}
```

## Integration with External Logging Services

### ELK Stack (Elasticsearch, Logstash, Kibana)

```bash
# Stream logs to ELK
tail -f ./logs/api-shell.jsonl | filebeat -c filebeat.yml
```

**filebeat.yml:**
```yaml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - ./logs/api-shell.jsonl
  json.message_key: message
  json.keys_under_root: true

output.elasticsearch:
  hosts: ["localhost:9200"]
```

### Datadog

```typescript
// Install Datadog agent and configure:
const jsonLogger = createStructuredLoggingMiddleware({
  service: "api-shell",
  environment: "production",
  level: "INFO",
  outputToFile: true,
  logFilePath: "/var/log/api-shell/app.jsonl",
});

// Datadog agent will automatically pick up and parse JSON logs
```

**datadog.yaml:**
```yaml
logs:
  - type: file
    path: /var/log/api-shell/app.jsonl
    service: api-shell
    source: nodejs
    tags:
      - env:production
```

### CloudWatch Logs

```bash
# Configure CloudWatch agent to tail JSON logs
aws logs put-subscription-filter \
  --log-group-name /api-shell/logs \
  --filter-name api-shell-filter \
  --filter-pattern "[...]"
```

### Splunk

```bash
# Configure Splunk to ingest JSON logs
# In inputs.conf:
[monitor:///var/log/api-shell/app.jsonl]
sourcetype = json
index = main
```

## Querying Logs

### ELK/Kibana Queries

```json
{
  "query": {
    "match": {
      "requestId": "req_1701234000000_1"
    }
  }
}
```

### Datadog Log Explorer

```
service:api-shell status:500 env:production
```

```
service:api-shell duration:>1000
```

### CloudWatch Insights

```
fields @timestamp, @message, status, duration
| filter service = "api-shell"
| stats avg(duration), max(duration) by method
```

## Performance Considerations

- **File I/O**: Logging to file may have some overhead. Use async I/O in production.
- **Log Size**: Keep `maxBodySize` reasonable to avoid large logs.
- **Log Level**: Use `WARN` or `ERROR` in production for minimal overhead.
- **Disk Space**: Monitor log file growth in production.

## Best Practices

✅ **Use service name**: Always specify a descriptive service name for multi-service deployments  
✅ **Set environment**: Clearly identify production vs staging vs development  
✅ **Include user context**: Enable `userId` extraction for user-centric debugging  
✅ **Use log levels**: Don't log everything at DEBUG in production  
✅ **Monitor file size**: Implement log rotation for file logging  
✅ **Correlate via requestId**: Use request IDs to trace issues across services  
✅ **Include timestamps**: Always use ISO 8601 format for easy parsing  

## File Rotation

For production environments, implement log rotation:

```bash
#!/bin/bash
# rotate-logs.sh
LOG_FILE="/var/log/api-shell/app.jsonl"
ARCHIVE_DIR="/var/log/api-shell/archive"

# Rotate daily at midnight
0 0 * * * /path/to/rotate-logs.sh

# Archive old logs
timestamp=$(date +%Y%m%d)
mv $LOG_FILE $ARCHIVE_DIR/app-$timestamp.jsonl
gzip $ARCHIVE_DIR/app-$timestamp.jsonl
```

## Troubleshooting

### Logs not appearing in file

```typescript
// Make sure file logging is enabled
const logger = createStructuredLoggingMiddleware({
  outputToFile: true,
  logFilePath: "./logs/api-shell.jsonl",
});

// Check file permissions
chmod 755 ./logs
chmod 644 ./logs/api-shell.jsonl
```

### JSON parsing errors

```bash
# Validate JSON log file
jq . ./logs/api-shell.jsonl | head

# Fix corrupt logs by filtering valid JSON
jq -s '.[] | select(.timestamp)' ./logs/api-shell.jsonl > clean.jsonl
```

### High disk usage

```typescript
// Reduce log detail in production
const logger = createStructuredLoggingMiddleware({
  level: "WARN",           // Only WARN and ERROR
  includeDetails: false,   // Skip request/response bodies
  maxBodySize: 256,        // Smaller body truncation
});
```
