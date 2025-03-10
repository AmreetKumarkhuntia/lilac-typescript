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
 * Configuration object for Kafka producer/consumer.
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
   * Disconnects producer after sending messages
   */

  disconnectAfterSendingMessage: boolean;

  /**
   * Publishing key for kafka
   */
  messageKey?: string | null;

  /**
   * Custom ProducerConfig
   */

  producerConfig: ProducerConfig;
};

/**
 * * Type for logger settings configuration.
 * ? Defines how the logger will behave and format logs.
 */
export type LoggerSettings = {
  /** Order of log fields. */
  displayOrder: string[];

  /** Color settings for each log field. */
  colorsMap: Record<string, ColorSet>;

  /** Enables/disables separator between logs. */
  enablePrintSeparator: boolean;

  /** Character/string to use as separator. */
  printSeparator: string;

  /** Adds space between fields if true. */
  enablePrintSpaceBetweenLogKeys: boolean;

  /** Auto-increments log counter. */
  enableLogCounterIncrement: boolean;

  /** Masking keys. */
  maskingKeys: Set<string>;

  /** Enables/disables masking keys. */
  enableKeyMasking: boolean;

  /** Enables/disables formatting of keys. */
  skipFormatting: boolean;

  /** Enable/disable kafka */
  enableKafkaLogPublishing?: boolean;

  /** Kafka config for publishing logs */
  kafkaConfig?: KafkaConfig | null;

  /** Kafka client to send message etc... */
  kafkaClient?: Kafka | null;
};
