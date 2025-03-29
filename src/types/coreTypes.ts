import { NodeSDK } from '@opentelemetry/sdk-node';
import { Kafka, ProducerConfig } from 'kafkajs';

/**
 * * Type for available log fields in display settings.
 */
export type LogField =
  | 'TIME'
  | 'ORDERID'
  | 'SESSIONID'
  | 'PROCESSID'
  | 'FUNCTIONNAME'
  | 'FUNCTIONTYPE'
  | 'BODY';

/**
 * * Type for available object keys used in the keyToSettingMap.
 */
export type LogKey =
  | 'orderId'
  | 'sessionId'
  | 'processId'
  | 'functionName'
  | 'functionType'
  | 'body'
  | 'time';

/**
 * * Type for different function categories or types in logging.
 */
export type FunctionType =
  | 'FUNCTION_CALLED'
  | 'FUNCTION_CALL_RESULT'
  | 'FUNCTION_INFO'
  | 'EXTERNAL_API_REQUEST'
  | 'EXTERNAL_API_RESPONSE'
  | 'EXTERNAL_API_INFO'
  | 'EXCEPTION'
  | 'SERVER_REQUEST'
  | 'SERVER_RESPONSE'
  | 'SERVER_INFO'
  | 'DB_QUERY_REQUEST'
  | 'DB_QUERY_RESPONSE'
  | 'DB_QUERY_INFO'
  | 'DEBUG'
  | 'REDIS_QUERY_REQUEST'
  | 'REDIS_QUERY_RESULT'
  | 'REDIS_QUERY_INFO';

/**
 * * Type for key-color mappings in defaultKeyColorMap.
 */
export type KeyColorMap = Record<LogKey, ColorSet>;

/**
 * * Type for color settings used in the logger.
 */
export type ColorSet = {
  /** Foreground color. */
  fgColor: string;

  /** Background color. */
  bgColor: string;

  /** Complementary foreground color. */
  fgComplementary: string;

  /** Complementary background color. */
  bgComplementary: string;
};

/**
 * * Type for tracking log details like session and process IDs.
 */
export type LogSetValues = {
  /** Unique identifier for log entries. */
  orderId: number;

  /** Session ID, generated automatically. */
  sessionId: string | null;

  /** Process ID, generated automatically. */
  processId: string | null;
};

//region MAIN LOGGER TYPES

/**
 * * Type defining a log entry structure.
 * @typedef {Object} ProcessLog
 * @example <caption>Example log entry</caption>
 * {
 *   "orderId": 42,
 *   "sessionId": "a1b2c3d4-e5f6-7890",
 *   "processId": "p1q2r3s4-t5u6-7890",
 *   "functionName": "processPayment",
 *   "functionType": "FUNCTION_CALLED",
 *   "body": "{\"amount\":100,\"currency\":\"USD\"}"
 * }
 *
 * @property {number} orderId - Sequential log entry number.
 * @property {string} sessionId - Unique session identifier.
 * @property {string} processId - Unique process identifier.
 * @property {string} functionName - Name of the logged function/method.
 * @property {FunctionType|string} functionType - Type/category of the function call.
 * @property {string} body - Additional log data as JSON string.
 *
 * @schema {Object} ProcessLogSchema
 * $schema: "http://json-schema.org/draft-07/schema#"
 * type: "object"
 * required: ["orderId", "sessionId", "processId", "functionName", "functionType", "body"]
 * properties:
 *   orderId:
 *     type: "number"
 *     minimum: 0
 *   sessionId:
 *     type: "string"
 *     pattern: "^[a-f0-9-]+$"
 *   processId:
 *     type: "string"
 *     pattern: "^[a-f0-9-]+$"
 *   functionName:
 *     type: "string"
 *     minLength: 1
 *   functionType:
 *     type: "string"
 *     enum: ["FUNCTION_CALLED", "FUNCTION_CALL_RESULT", "FUNCTION_INFO", ...]
 *   body:
 *     type: "string"
 *     contentMediaType: "application/json"
 * additionalProperties: false
 */
export type ProcessLog = {
  orderId: number;
  sessionId: string;
  processId: string;
  functionName: string;
  functionType: FunctionType | string;
  body: string;
};

/**
 * * Configuration object for Kafka producer/consumer.
 * @typedef {Object} KafkaConfig
 * @example <caption>Example Kafka configuration</caption>
 * {
 *   "brokerList": ["kafka1:9092", "kafka2:9092"],
 *   "clientId": "my-app-producer",
 *   "kafkaTopics": ["logs", "events"],
 *   "disconnectAfterSendingMessage": false,
 *   "messageKey": "session-123",
 *   "producerConfig": {
 *     "allowAutoTopicCreation": true,
 *     "transactionTimeout": 60000
 *   }
 * }
 *
 * @property {string[]} brokerList - List of Kafka broker addresses.
 *   Format: ["host:port", "host:port"]
 * @property {string} clientId - Client ID used to identify the Kafka client.
 * @property {string[]} kafkaTopics - List of Kafka topics to produce/consume from.
 * @property {boolean} disconnectAfterSendingMessage - If true, closes producer after each message.
 * @property {string|null} [messageKey] - Publishing key for Kafka messages.
 * @property {ProducerConfig} producerConfig - Kafka producer configuration.
 *
 * @schema {Object} KafkaConfigSchema
 * $schema: "http://json-schema.org/draft-07/schema#"
 * type: "object"
 * required: ["brokerList", "clientId", "kafkaTopics", "disconnectAfterSendingMessage", "producerConfig"]
 * properties:
 *   brokerList:
 *     type: "array"
 *     items:
 *       type: "string"
 *       pattern: "^.+:\\d+$"
 *     minItems: 1
 *     description: "List of Kafka broker addresses in host:port format"
 *   clientId:
 *     type: "string"
 *     minLength: 1
 *   kafkaTopics:
 *     type: "array"
 *     items:
 *       type: "string"
 *     minItems: 1
 *   disconnectAfterSendingMessage:
 *     type: "boolean"
 *   messageKey:
 *     type: ["string", "null"]
 *   producerConfig:
 *     $ref: "#/definitions/ProducerConfig"
 * additionalProperties: false
 */
export type KafkaConfig = {
  brokerList: string[];
  clientId: string;
  kafkaTopics: string[];
  disconnectAfterSendingMessage: boolean;
  messageKey?: string | null;
  producerConfig: ProducerConfig;
};

/**
 * * Configuration for OpenTelemetry tracing.
 * @typedef {Object} OpenTelemetryConfig
 * @example <caption>Example OpenTelemetry configuration</caption>
 * {
 *   "url": "http://otel-collector:4317",
 *   "scheduledDelayMillis": 5000,
 *   "maxExportBatchSize": 100,
 *   "maxQueueSize": 1000
 * }
 *
 * @property {string} url - Collector endpoint URL.
 * @property {number} scheduledDelayMillis - Interval between span exports in ms.
 * @property {number} maxExportBatchSize - Maximum spans per batch.
 * @property {number} maxQueueSize - Maximum queue size.
 *
 * @schema {Object} OpenTelemetryConfigSchema
 * $schema: "http://json-schema.org/draft-07/schema#"
 * type: "object"
 * required: ["url", "scheduledDelayMillis", "maxExportBatchSize", "maxQueueSize"]
 * properties:
 *   url:
 *     type: "string"
 *     format: "uri"
 *   scheduledDelayMillis:
 *     type: "number"
 *     minimum: 1000
 *   maxExportBatchSize:
 *     type: "number"
 *     minimum: 1
 *   maxQueueSize:
 *     type: "number"
 *     minimum: 10
 *   serviceName:
 *     type: string
 *     example: "service abcd"
 * additionalProperties: false
 */
export type OpenTelemetryConfig = {
  url: string;
  scheduledDelayMillis: number;
  maxExportBatchSize: number;
  maxQueueSize: number;
  serviceName: string;
} | null;
/**
 * * Comprehensive configuration for the logger's behavior and output formatting.
 * @typedef {Object} LoggerSettings
 * @example <caption>Basic Configuration</caption>
 * {
 *   displayOrder: ['TIME', 'FUNCTIONNAME'],
 *   colorsMap: {...},
 *   enablePrintSeparator: true,
 *   printSeparator: '|',
 *   enableKeyMasking: true
 * }
 *
 * @example <caption>With Integrations</caption>
 * {
 *   ...basicConfig,
 *   enableKafkaLogPublishing: true,
 *   kafkaConfig: {brokerList: ['kafka:9092']},
 *   enableOpenTelemetryPublishing: true,
 *   openTelemetryConfig: {url: 'http://otel:4317'}
 * }
 *
 * // Core Formatting Properties
 * @property {string[]} displayOrder - Order of log fields in output
 * @property {Record<string, ColorSet>} colorsMap - Color mappings for log fields
 * @property {boolean} enablePrintSeparator - Show separator between fields
 * @property {string} printSeparator - Character(s) to use as separator
 * @property {boolean} enablePrintSpaceBetweenLogKeys - Add spaces between fields
 * @property {boolean} enableLogCounterIncrement - Auto-increment log counter
 * @property {Set<string>} maskingKeys - Keys to mask in log output
 * @property {boolean} enableKeyMasking - Enable/disable masking
 * @property {boolean} skipFormatting - Skip all formatting if true
 *
 * // Kafka Integration
 * @property {boolean} [enableKafkaLogPublishing] - Enable Kafka log publishing
 * @property {KafkaConfig|null} [kafkaConfig] - Kafka connection config
 * @property {Kafka|null} [kafkaClient] - Active Kafka client instance
 *
 * // OpenTelemetry Integration
 * @property {boolean} [enableOpenTelemetryPublishing] - Enable OpenTelemetry
 * @property {OpenTelemetryConfig|null} [openTelemetryConfig] - OTEL config
 * @property {string|null} [openTelemetryURL] - @deprecated Use openTelemetryConfig
 */
export type LoggerSettings = {
  displayOrder: string[];
  colorsMap: Record<string, ColorSet>;
  enablePrintSeparator: boolean;
  printSeparator: string;
  enablePrintSpaceBetweenLogKeys: boolean;
  enableLogCounterIncrement: boolean;
  maskingKeys: Set<string>;
  enableKeyMasking: boolean;
  skipFormatting: boolean;
  enableKafkaLogPublishing?: boolean;
  kafkaConfig?: KafkaConfig | null;
  kafkaClient?: Kafka | null;
  enableOpenTelemetryPublishing?: boolean;
  openTelemetryConfig?: OpenTelemetryConfig | null;
  /** @deprecated Use openTelemetryConfig instead */
  openTelemetryURL?: string | null;
};
