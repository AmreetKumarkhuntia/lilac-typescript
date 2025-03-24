Here's a `README.md` file that documents the Elasticsearch operations in your code:

```markdown
# Elasticsearch Operations

This document contains a collection of Elasticsearch queries and operations for managing and querying logs, particularly for OpenTelemetry (OTel) logs.

## Basic Operations

### Check Cluster Health
```json
GET _cat/shards?v
```

### Get Index Mappings
```json
GET _mapping
```

## OTel Logs Operations

### Open an OTel Logs Index
```json
POST /otel-logs/_open
```

### Search OTel Logs for a Specific Service
```json
GET /otel-logs/_search
{
  "query": {
    "match": {
      "resource.attributes.service.name.stringValue": "demo-service"
    }
  }
}
```

### Get Sample Document from OTel Logs
```json
GET /otel-logs/_search
{
  "query": {
    "match_all": {}
  },
  "size": 1
}
```

### Create/Update OTel Logs Index Mapping
```json
PUT /otel-logs
{
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "service.name": { "type": "keyword" },
      "message": { "type": "text" }
    }
  }
}
```

### Delete OTel Logs Index
```json
DELETE /otel-logs
```

## Template Queries

The following template demonstrates how to use variables in queries:

```json
GET ${exampleVariable1} // _search
{
  "query": {
    "${exampleVariable2}": {} // match_all
  }
}
```

Note: Replace `${exampleVariable1}` and `${exampleVariable2}` with actual values when using the template.
```

This README provides clear documentation for each Elasticsearch operation, making it easy for users to understand and use the queries. The markdown format makes it readable both in raw form and when rendered by GitHub or other markdown viewers.