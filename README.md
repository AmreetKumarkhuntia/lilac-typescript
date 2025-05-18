# Lilac TypeScript Logger ![version](https://img.shields.io/npm/v/lilac-typescript) ![license](https://img.shields.io/npm/l/lilac-typescript)

A comprehensive Node.js process logger for backend applications with Kafka and OpenTelemetry integration.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
  Producers
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **Structured Logging**: Track function calls, API requests, DB queries and more
- **Multiple Outputs**: Console, Kafka, and OpenTelemetry support
- **Custom Formatting**: Color-coded output with customizable display order
- **Security**: Automatic sensitive data masking
- **Distributed Tracing**: OpenTelemetry integration for end-to-end tracing
- **Event Streaming**: Kafka integration for centralized log collection

## Installation

```bash
npm install lilac-typescript
```

## Usage

### Basic Logging

```typescript
import { ProcessLogger } from 'lilac-typescript';

// Initialize logger
const logger = new ProcessLogger();

// Log function calls and results
function processData(input: any) {
  logger.logFunctionCalled('processData', { input });

  const result = transformData(input);
  logger.logFunctionCallResult('processData', { result });

  return result;
}
```

### Kafka Setup

```typescript
const logger = new ProcessLogger({
  enableKafkaLogPublishing: true,
  kafkaConfig: {
    brokerList: 'localhost:9092',
    clientId: 'my-service',
    kafkaTopics: 'service-logs',
    messageKey: 'service',
    disconnectAfterSendingMessage: false,
  },
});
```

### OpenTelemetry Setup

```typescript
const logger = new ProcessLogger({
  enableOpenTelemetryPublishing: true, // Enable OpenTelemetry publishing
  openTelemetryConfig: {
    // Provide OpenTelemetry configuration
    url: 'http://localhost:4317', // Replace with your collector endpoint
    scheduledDelayMillis: 5000,
    maxExportBatchSize: 100,
    maxQueueSize: 1000,
    serviceName: 'my-service', // Replace with your service name
  },
});

// Initialize tracing
await logger.initOpenTelemetryTracing();
```

### Docker Deployment

Start Kafka and OpenTelemetry containers:

```bash
npm run docker:kafka:ot
npm run docker:run:ot
```

## Configuration

### Core Logging Settings

| Parameter                        | Type                       | Default                            | Required | Description                   |
| -------------------------------- | -------------------------- | ---------------------------------- | -------- | ----------------------------- |
| `displayOrder`                   | `string[]`                 | `['TIME', 'FUNCTIONNAME', 'BODY']` | No       | Order of fields in log output |
| `colorsMap`                      | `Record<string, ColorSet>` | Default color mappings             | No       | Custom colors for log fields  |
| `printSeparator`                 | `string`                   | `\|`                               | No       | Separator between log fields  |
| `enablePrintSeparator`           | `boolean`                  | `true`                             | No       | Show/hide field separators    |
| `enablePrintSpaceBetweenLogKeys` | `boolean`                  | `true`                             | No       | Add spaces between fields     |
| `enableLogCounterIncrement`      | `boolean`                  | `true`                             | No       | Auto-increment log counter    |
| `maskingKeys`                    | `Set<string>`              | Empty Set                          | No       | Keys to mask in log output    |
| `enableKeyMasking`               | `boolean`                  | `true`                             | No       | Enable/disable data masking   |
| `skipFormatting`                 | `boolean`                  | `false`                            | No       | Skip all formatting if true   |

### Kafka Integration

| Parameter                  | Type            | Required | Description                    |
| -------------------------- | --------------- | -------- | ------------------------------ |
| `enableKafkaLogPublishing` | `boolean`       | No       | Master enable switch           |
| `kafkaConfig`              | `KafkaConfig`   | Yes\*    | \*Required when enabled        |
| `kafkaClient`              | `Kafka \| null` | No       | Pre-configured client instance |

**KafkaConfig Required Fields**:

```typescript
{
  brokerList: string[];  // Min 1 broker in "host:port" format (required)
  clientId: string;      // Non-empty string identifier (required)
  kafkaTopics: string[]; // Min 1 topic name (required)
  disconnectAfterSendingMessage: boolean; // (required)
  producerConfig: ProducerConfig; // See example below (required)
  messageKey?: string | null;     // Optional publishing key
}
```

**Example ProducerConfig**:

```typescript
{
  allowAutoTopicCreation: true,
  transactionTimeout: 30000,
  retry: {
    maxRetryTime: 30000,
    retries: 5
  }
}
```

**Validation Requirements**:

- `brokerList`: Must contain at least 1 valid "host:port"
- `clientId`: Non-empty string
- `kafkaTopics`: Must contain at least 1 topic name

### OpenTelemetry Integration

| Parameter                       | Type                  | Required | Description             |
| ------------------------------- | --------------------- | -------- | ----------------------- |
| `enableOpenTelemetryPublishing` | `boolean`             | No       | Master enable switch    |
| `openTelemetryConfig`           | `OpenTelemetryConfig` | Yes\*    | \*Required when enabled |

**OpenTelemetryConfig Required Fields**:

```typescript
{
  url: string; // Collector endpoint (required)
  scheduledDelayMillis: number; // Min: 1000 (default: 5000)
  maxExportBatchSize: number; // Min: 1 (default: 100)
  maxQueueSize: number; // Min: 10 (default: 1000)
  serviceName: string; // Service identifier
}
```

**Minimum Values** (enforced by schema validation):

- `scheduledDelayMillis`: ≥1000 ms
- `maxExportBatchSize`: ≥1 span
- `maxQueueSize`: ≥10 spans

## API Reference

### Core Logging Methods

- `logFunctionCalled(name: string, body: object)`
- `logFunctionCallResult(name: string, result: object)`
- `logException(name: string, error: string)`
- `logDebug(message: string, data: object)`

### Database Logging

- `logDbQueryRequest(query: string, params: object)`
- `logDbQueryResponse(query: string, result: object)`

### Integration Management

- `initOpenTelemetryTracing(): Promise<void>`
- `disconnectKafkaClient(): Promise<void>`

## Examples

Example log output:

```

2023-01-01T12:00:00 [FUNCTION_CALLED] processData {"input":"test"} [SESSION:1234]
2023-01-01T12:00:01 [FUNCTION_CALL_RESULT] processData {"result":"TEST"} [SESSION:1234]

```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

Include:

- Description of changes
- Test cases
- Screenshots if applicable
- Updated documentation

## License

Apache 2.0 License - See [LICENSE](LICENSE) for details.

## Contact

- **Author**: Amreet Khuntia
- **GitHub**: [AmreetKumarkhuntia](https://github.com/AmreetKumarkhuntia)
- **Issues**: [Project Issues](https://github.com/AmreetKumarkhuntia/lilac-typescript/issues)
