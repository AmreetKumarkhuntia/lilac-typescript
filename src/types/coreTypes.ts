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
 */
export type ProcessLog = {
  /** Order of the log entry. */
  orderId: number;

  /** Session ID associated with the log. */
  sessionId: string;

  /** Process ID associated with the log. */
  processId: string;

  /** Name of the logged function. */
  functionName: string;

  /** Category/type of the logged function. */
  functionType: FunctionType | string;

  /** Additional log information in JSON format. */
  body: string;
};

/**
 * * Configuration object for Kafka producer/consumer.
 */
export type KafkaConfig = {
  /**
   * List of Kafka broker addresses.
   * Example: ["kafka-broker1:9092", "kafka-broker2:9092"]
   */
  brokerList: string[];

  /**
   * Client ID used to identify the Kafka client.
   * Useful for tracking and debugging.
   */
  clientId: string;

  /**
   * List of Kafka topics to produce or consume from.
   * Example: ["topic1", "topic2"]
   */
  kafkaTopics: string[];

  /**
   * Disconnects producer after sending messages.
   * If true, the Kafka producer will close the connection after each message is sent.
   */
  disconnectAfterSendingMessage: boolean;

  /**
   * Publishing key for Kafka.
   * Used to determine message partitioning and ordering.
   */
  messageKey?: string | null;

  /**
   * Custom configuration for Kafka producer.
   * Allows fine-tuning of Kafka producer behavior.
   */
  producerConfig: ProducerConfig;
};

/**
 * * Type for logger settings configuration.
 * ? Defines how the logger will behave and format logs.
 */
export type LoggerSettings = {
  /** Order of log fields in the output. */
  displayOrder: string[];

  /** Color settings for each log field. */
  colorsMap: Record<string, ColorSet>;

  /** Enables/disables separator between logs. */
  enablePrintSeparator: boolean;

  /** Character/string to use as separator between log fields. */
  printSeparator: string;

  /** Adds space between fields if true. */
  enablePrintSpaceBetweenLogKeys: boolean;

  /** Auto-increments log counter with each new log entry. */
  enableLogCounterIncrement: boolean;

  /** List of keys to mask in the log output. */
  maskingKeys: Set<string>;

  /** Enables/disables masking of specific keys. */
  enableKeyMasking: boolean;

  /** Skips formatting of keys if true. */
  skipFormatting: boolean;

  //region KAFKA

  /** Enables/disables publishing logs to Kafka. */
  enableKafkaLogPublishing?: boolean;

  /** Configuration settings for Kafka log publishing. */
  kafkaConfig?: KafkaConfig | null;

  /** Kafka client instance used to send logs. */
  kafkaClient?: Kafka | null;

  //endregion

  //region OPEN TELEMETRY

  /** Enables/disables publishing logs to OpenTelemetry. */
  enableOpenTelemetryPublishing?: boolean;

  /** URL for the OpenTelemetry collector endpoint. */
  openTelemetryURL?: string | null;

  /** OpenTelemetry SDK instance used for logging. */
  openTelemetrySDK?: NodeSDK | null;

  //endregion
};
