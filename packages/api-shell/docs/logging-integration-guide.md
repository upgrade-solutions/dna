# Logging Integration Guide

Complete guide for integrating API Shell logging with external services.

## Two-Level Logging Architecture

The API Shell now supports two complementary logging systems:

### 1. **Plain Text Logging** (`logging.ts`)
- Human-readable format
- Default enabled
- Configurable via `LOG_LEVEL`, `LOG_INCLUDE_BODIES`, `LOG_INCLUDE_HEADERS`
- Best for: Development, quick debugging, console output

### 2. **Structured JSON Logging** (`structured-logging.ts`)
- Machine-parseable format
- Optional, enabled via `ENABLE_STRUCTURED_LOGGING=true`
- Includes service metadata, environment, user context
- Best for: Production, ELK/Datadog/CloudWatch integration, analytics

## Quick Start

### Development Environment

```bash
# Plain text logging only
LOG_LEVEL=debug deno run mod.ts

# With detailed logging
LOG_LEVEL=debug LOG_INCLUDE_BODIES=true deno run mod.ts
```

### Production Environment with Service Integration

```bash
# ELK Stack
ENABLE_STRUCTURED_LOGGING=true \
LOG_LEVEL=WARN \
LOG_TO_FILE=true \
LOG_FILE_PATH=/var/log/api-shell/app.jsonl \
deno run mod.ts

# Datadog
ENABLE_STRUCTURED_LOGGING=true \
LOG_LEVEL=WARN \
ENVIRONMENT=production \
deno run mod.ts

# CloudWatch
ENABLE_STRUCTURED_LOGGING=true \
LOG_LEVEL=INFO \
LOG_TO_FILE=true \
deno run mod.ts
```

## Service Integration Examples

### ELK Stack Integration

**1. Enable structured logging in API Shell:**

```bash
ENABLE_STRUCTURED_LOGGING=true \
LOG_TO_FILE=true \
LOG_FILE_PATH=/var/log/api-shell/app.jsonl \
deno run mod.ts
```

**2. Install and configure Filebeat:**

```bash
# Install filebeat
curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-8.0.0-linux-x86_64.tar.gz
tar xzf filebeat-8.0.0-linux-x86_64.tar.gz

# Configure filebeat.yml
cat > filebeat.yml << 'EOF'
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/api-shell/app.jsonl
  json.message_key: message
  json.keys_under_root: true
  json.add_error_key: true

processors:
  - add_fields:
      target: ''
      fields:
        service: api-shell
        environment: production

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "api-shell-%{+yyyy.MM.dd}"

logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/filebeat
  name: filebeat
  keepfiles: 7
  permissions: 0644
EOF

# Start filebeat
./filebeat/filebeat -c filebeat.yml
```

**3. Query logs in Kibana:**

```
# Search by request ID
requestId: "req_1701234000000_1"

# Search by status code
status: 500

# Search by duration (slow requests)
duration: [1000 TO *]

# Search by user
userId: "user_123"

# Time-series of errors
level: ERROR | stats count() by @timestamp
```

### Datadog Integration

**1. Configure API Shell:**

```bash
ENABLE_STRUCTURED_LOGGING=true \
LOG_LEVEL=INFO \
ENVIRONMENT=production \
deno run mod.ts
```

**2. Configure Datadog Agent:**

```yaml
# /etc/datadog-agent/conf.d/api_shell.d/conf.yaml
logs:
  - type: file
    path: /var/log/api-shell/app.jsonl
    service: api-shell
    source: nodejs
    parsing_rules:
      - type: multi_line
        line_pattern: '^\{'
        name: json_log
    tags:
      - env:production
      - service:api-shell
```

**3. Query in Datadog Log Explorer:**

```
service:api-shell status:5*
```

```
service:api-shell @duration:>1000
```

```
service:api-shell env:production @level:ERROR
```

### CloudWatch Integration

**1. Configure API Shell:**

```bash
ENABLE_STRUCTURED_LOGGING=true \
LOG_TO_FILE=true \
LOG_FILE_PATH=/var/log/api-shell/app.jsonl \
deno run mod.ts
```

**2. Configure CloudWatch Agent:**

```json
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/api-shell/app.jsonl",
            "log_group_name": "/aws/api-shell/logs",
            "log_stream_name": "{instance_id}",
            "timestamp_format": "%Y-%m-%dT%H:%M:%S.%fZ"
          }
        ]
      }
    }
  }
}
```

**3. Query with CloudWatch Insights:**

```
fields @timestamp, @message, status, duration, userId
| filter service = "api-shell"
| stats count() as request_count, avg(duration) as avg_duration by status
```

```
fields @timestamp, @message
| filter level = "ERROR"
| stats count() by requestId
```

### Splunk Integration

**1. Configure API Shell:**

```bash
ENABLE_STRUCTURED_LOGGING=true \
LOG_TO_FILE=true \
LOG_FILE_PATH=/var/log/api-shell/app.jsonl \
deno run mod.ts
```

**2. Configure Splunk Universal Forwarder:**

```ini
# /opt/splunkforwarder/etc/apps/api_shell/local/inputs.conf
[monitor:///var/log/api-shell/app.jsonl]
disabled = false
sourcetype = json
source = api-shell
index = main
_TCP_ROUTING = 0
time_before_close = 5
multiline_event_extra_waittime = 100

[parsing]
json.line_breaker = [\n]
```

```ini
# /opt/splunkforwarder/etc/apps/api_shell/local/props.conf
[json]
SHOULD_LINEMERGE = false
TIMESTAMP_FIELDS = timestamp
TIME_FORMAT = %Y-%m-%dT%H:%M:%S.%fZ
```

**3. Search in Splunk:**

```
source="api-shell" status=500
```

```
source="api-shell" earliest=-24h@h latest=now | stats avg(duration) by method
```

## Docker Deployment

### Single Container with Logging

```dockerfile
FROM denoland/deno:latest

WORKDIR /app

COPY . .

# Create logs directory
RUN mkdir -p /var/log/api-shell

ENV ENABLE_STRUCTURED_LOGGING=true
ENV LOG_TO_FILE=true
ENV LOG_FILE_PATH=/var/log/api-shell/app.jsonl
ENV ENVIRONMENT=production

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "--allow-hrtime", "--allow-write", "mod.ts"]
```

### Docker Compose with ELK Stack

```yaml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"

  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

  filebeat:
    image: docker.elastic.co/beats/filebeat:8.0.0
    volumes:
      - ./filebeat.yml:/usr/share/filebeat/filebeat.yml
      - api-shell-logs:/var/log/api-shell
    depends_on:
      - elasticsearch

  api-shell:
    build: .
    ports:
      - "3000:3000"
    environment:
      ENABLE_STRUCTURED_LOGGING: "true"
      LOG_TO_FILE: "true"
      LOG_FILE_PATH: /var/log/api-shell/app.jsonl
      ENVIRONMENT: production
    volumes:
      - api-shell-logs:/var/log/api-shell

volumes:
  api-shell-logs:
```

## Kubernetes Deployment

### With Fluent Bit Sidecar

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-shell
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-shell
  template:
    metadata:
      labels:
        app: api-shell
    spec:
      containers:
      - name: api-shell
        image: api-shell:latest
        ports:
        - containerPort: 3000
        env:
        - name: ENABLE_STRUCTURED_LOGGING
          value: "true"
        - name: LOG_TO_FILE
          value: "true"
        - name: LOG_FILE_PATH
          value: /var/log/api-shell/app.jsonl
        - name: ENVIRONMENT
          value: production
        volumeMounts:
        - name: logs
          mountPath: /var/log/api-shell

      - name: fluent-bit
        image: fluent/fluent-bit:latest
        volumeMounts:
        - name: logs
          mountPath: /var/log/api-shell
        - name: fluent-bit-config
          mountPath: /fluent-bit/etc/

      volumes:
      - name: logs
        emptyDir: {}
      - name: fluent-bit-config
        configMap:
          name: fluent-bit-config
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluent-bit-config
data:
  fluent-bit.conf: |
    [SERVICE]
        Flush        5
        Daemon       Off
        Log_Level    info

    [INPUT]
        Name              tail
        Path              /var/log/api-shell/app.jsonl
        Parser            json
        Tag               api-shell.*
        Refresh_Interval  5

    [OUTPUT]
        Name   es
        Match  api-shell.*
        Host   elasticsearch.default.svc.cluster.local
        Port   9200
        Index  api-shell
```

## Log Analysis Queries

### Performance Analysis

```sql
-- Average response time by endpoint
SELECT path, AVG(duration) as avg_time, MAX(duration) as max_time
FROM logs
WHERE service = 'api-shell'
GROUP BY path
ORDER BY avg_time DESC
```

### Error Tracking

```sql
-- Errors by type
SELECT level, COUNT(*) as count
FROM logs
WHERE service = 'api-shell' AND level IN ('WARN', 'ERROR')
GROUP BY level
ORDER BY count DESC
```

### User Activity

```sql
-- Top users by request count
SELECT userId, COUNT(*) as request_count
FROM logs
WHERE service = 'api-shell'
GROUP BY userId
ORDER BY request_count DESC
```

## Monitoring and Alerting

### ELK Stack Alerts

```json
{
  "trigger": {
    "schedule": {
      "interval": "5m"
    }
  },
  "input": {
    "search": {
      "request": {
        "indices": ["api-shell-*"],
        "body": {
          "query": {
            "range": {
              "timestamp": {
                "gte": "now-5m"
              }
            }
          },
          "aggs": {
            "status_codes": {
              "terms": {
                "field": "status"
              }
            }
          }
        }
      }
    }
  },
  "condition": {
    "compare": {
      "ctx.payload.aggregations.status_codes.buckets[?(@.key==500)].doc_count": {
        "gt": 10
      }
    }
  },
  "actions": {
    "email": {
      "email": {
        "to": "alerts@example.com",
        "subject": "API Shell: High error rate detected"
      }
    }
  }
}
```

## Best Practices

✅ **Use both logging systems** for comprehensive coverage  
✅ **Set appropriate log levels** per environment  
✅ **Include request IDs** for tracing across services  
✅ **Monitor log file size** and implement rotation  
✅ **Correlate logs** using requestId and userId  
✅ **Archive old logs** for compliance and cost  
✅ **Use structured data** for better querying  
✅ **Alert on errors** and slow requests  

## Troubleshooting

### Logs not appearing in ELK

1. Check filebeat is running: `sudo systemctl status filebeat`
2. Verify file permissions: `ls -la /var/log/api-shell/`
3. Check filebeat config: `filebeat test config`
4. View filebeat logs: `tail -f /var/log/filebeat/filebeat`

### High disk usage

```bash
# Check log file size
du -sh /var/log/api-shell/app.jsonl

# Compress old logs
gzip /var/log/api-shell/app-*.jsonl

# Implement rotation with logrotate
cat > /etc/logrotate.d/api-shell << 'EOF'
/var/log/api-shell/app.jsonl {
    daily
    compress
    rotate 30
    notifempty
    create 0644 nobody nobody
}
EOF
```

### JSON parsing errors

```bash
# Validate JSON logs
jq . /var/log/api-shell/app.jsonl | head -20

# Extract valid lines only
jq -s '.[] | select(.timestamp)' /var/log/api-shell/app.jsonl > clean.jsonl
```
