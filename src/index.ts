/**
 * Main ProcessLogger module that provides comprehensive logging functionality
 * with support for OpenTelemetry and Kafka integration.
 * @module ProcessLogger
 */

import type {
  FunctionType,
  LoggerSettings,
  LogSetValues,
  ProcessLog,
} from './types';
import {
  defaultDisplaySettings,
  keyToSettingMap,
  colorsMap,
  defaultKeyColorMap,
  defaultSeparator,
  defaultMaskingKeys,
} from './defaults.ts';
import { generateUUID, formatTimestamp, maskKeys } from './utils.ts';
import { connectKafka, disconnectKafka, sendMessage } from './kafka/index.ts';
import { Message } from 'kafkajs';
import {
  initTracing,
  shutdownOpenTelemetryTracing,
} from './openTelemetry/index.ts';
import { SpanStatusCode, trace } from '@opentelemetry/api';

/**
 * ProcessLogger class for logging process information with JSON support.
 * Allows customization of the display order and color settings.
 *
 * @class ProcessLogger
 * @example <caption>Basic usage</caption>
 * const logger = new ProcessLogger();
 * logger.logFunctionCalled('processPayment', {
 *   amount: 100,
 *   currency: 'USD'
 * });
 *
 * @example <caption>With Kafka configuration</caption>
 * const logger = new ProcessLogger({
 *   enableKafkaLogPublishing: true,
 *   kafkaConfig: {
 *     brokerList: ['kafka1:9092'],
 *     clientId: 'my-app',
 *     kafkaTopics: ['logs'],
 *     disconnectAfterSendingMessage: false
 *   }
 * });
 *
 * @schema {Object} ProcessLoggerOptions
 * $schema: "http://json-schema.org/draft-07/schema#"
 * type: "object"
 * properties:
 *   displayOrder:
 *     $ref: "#/definitions/LogField[]"
 *   colorsMap:
 *     $ref: "#/definitions/KeyColorMap"
 *   printSeparator:
 *     type: "string"
 *   maskingKeys:
 *     type: "array"
 *     items:
 *       type: "string"
 *   enablePrintSeparator:
 *     type: "boolean"
 *   enablePrintSpaceBetweenLogKeys:
 *     type: "boolean"
 *   enableLogCounterIncrement:
 *     type: "boolean"
 *   enableKeyMasking:
 *     type: "boolean"
 *   skipFormatting:
 *     type: "boolean"
 *   enableKafkaLogPublishing:
 *     type: "boolean"
 *   kafkaConfig:
 *     $ref: "#/definitions/KafkaConfig"
 *   enableOpenTelemetryPublishing:
 *     type: "boolean"
 *   openTelemetryConfig:
 *     $ref: "#/definitions/OpenTelemetryConfig"
 */
export class ProcessLogger {
  //region LOGGER SETTINGS

  /**
   * Default logger settings for format and behavior.
   */
  settings: LoggerSettings = {
    displayOrder: defaultDisplaySettings,
    colorsMap: defaultKeyColorMap,
    printSeparator: defaultSeparator,
    maskingKeys: defaultMaskingKeys,
    enablePrintSeparator: true,
    enablePrintSpaceBetweenLogKeys: true,
    enableLogCounterIncrement: true,
    enableKeyMasking: true,
    skipFormatting: false,
    // all kafka settings
    enableKafkaLogPublishing: false,
    kafkaConfig: null,
    kafkaClient: null,
    // OpenTelemetry settings
    enableOpenTelemetryPublishing: false,
    openTelemetryConfig: undefined,
  };

  /**
   * Values used to track order, session, and process IDs.
   * @typedef {Object} LogSetValues
   * @property {number} orderId - Auto-incrementing log sequence number
   * @property {string|null} sessionId - Unique session identifier
   * @property {string|null} processId - Unique process identifier
   *
   * @example <caption>Generated Values Structure</caption>
   * {
   *   orderId: 42,
   *   sessionId: 'a1b2c3d4-e5f6-7890',
   *   processId: 'p1q2r3s4-t5u6-7890'
   * }
   *
   * @note Values are automatically generated when:
   * - Logger is instantiated (sessionId)
   * - First log is recorded (processId)
   * - Each log increments orderId
   */
  logSetValues: LogSetValues = {
    orderId: 0,
    sessionId: null,
    processId: null,
  };

  //region CONSTRUCTOR

  /**
   * Creates a new ProcessLogger instance with optional custom settings.
   * @param {Partial<LoggerSettings>} [settings] - Configuration overrides
   *
   * @example <caption>Basic Configuration</caption>
   * const logger = new ProcessLogger();
   *
   * @example <caption>Full Configuration</caption>
   * const logger = new ProcessLogger({
   *   displayOrder: ['TIME', 'FUNCTIONNAME'],
   *   colorsMap: customColors,
   *   enableKafkaLogPublishing: true,
   *   kafkaConfig: {
   *     brokerList: ['kafka:9092'],
   *     clientId: 'my-app',
   *     kafkaTopics: ['logs'],
   *     disconnectAfterSendingMessage: false
   *   },
   *   // ... other settings
   * });
   *
   * @schema {Object} LoggerSettingsSchema
   * $schema: "http://json-schema.org/draft-07/schema#"
   * type: "object"
   * properties:
   *   displayOrder:
   *     $ref: "#/definitions/LogField[]"
   *   enableKafkaLogPublishing:
   *     type: "boolean"
   *     default: false
   *   // ... remaining schema definitions
   *
   * @note If no settings provided, uses defaults.ts values
   * @throws {TypeError} If invalid settings structure provided
   * @throws {Error} If Kafka/OpenTelemetry connections fail when enabled
   */
  constructor(settings?: Partial<LoggerSettings>) {
    if (settings) {
      for (const key in settings) {
        if (this.settings.hasOwnProperty(key)) {
          this.settings[key] = settings[key];
        }
      }
    }
    if (this.settings.enableOpenTelemetryPublishing === true) {
      this.initOpenTelemetryTracing();
    }
    this.logSetValues.sessionId = generateUUID();
  }

  //region DIRECT LOG

  /**
   * Formats and prints a log entry to console based on display settings.
   * @param {ProcessLog} obj - The log entry to format and display
   *
   * @example <caption>Log formatting</caption>
   * this.directLog({
   *   orderId: 42,
   *   sessionId: 'session123',
   *   processId: 'process456',
   *   functionName: 'processPayment',
   *   functionType: 'FUNCTION_CALLED',
   *   body: '{"amount":100}'
   * });
   *
   * @note Handles:
   * - Field ordering per displayOrder
   * - Color formatting
   * - Separators between fields
   * - Special timestamp handling
   */
  private directLog(obj: ProcessLog): void {
    let printString = '';
    const size = this.settings.displayOrder.length;

    // Build formatted log string by processing each display setting
    for (let i = 0; i < size; i++) {
      const setting = this.settings.displayOrder[i];
      const key = keyToSettingMap[setting];
      if (key === undefined) continue;

      // Get next key for separator formatting
      const nextKey =
        i + 1 < size
          ? keyToSettingMap[this.settings.displayOrder[i + 1]]
          : null;

      // Get value - special handling for timestamp
      let val = setting !== 'TIME' ? (obj[key] ?? 'null') : formatTimestamp();

      if (!this.settings.skipFormatting) {
        printString += this.settings.colorsMap[key].fgColor;
        printString += this.settings.colorsMap[key].bgColor;
      }

      if (this.settings.enablePrintSpaceBetweenLogKeys && i !== 0) {
        printString += ' ' + val;
      } else {
        printString += val;
      }

      if (this.settings.enablePrintSpaceBetweenLogKeys) {
        printString += ' ';
      }

      if (!this.settings.skipFormatting) {
        printString += colorsMap.reset;

        if (i < size - 1 && this.settings.enablePrintSeparator) {
          printString += this.settings.colorsMap[key].fgComplementary;
          if (nextKey) {
            printString += this.settings.colorsMap[nextKey].bgColor;
          }
          printString += this.settings.printSeparator;
        }

        printString += colorsMap.reset;
      } else if (i < size - 1 && this.settings.enablePrintSeparator) {
        printString += this.settings.printSeparator;
      }
    }
    console.log(printString);
  }

  //region KAFKA FUNCTIONS

  /**
   * Establishes Kafka connection if needed for log publishing.
   * @returns {Promise<void>} Resolves when connection is established or skipped
   *
   * @note This method only connects if:
   * 1. Kafka publishing is enabled in settings
   * 2. No existing client connection exists
   * 3. Valid Kafka config is provided
   *
   * Automatically stores connected client in settings.kafkaClient
   */
  private async connectToKafka() {
    if (
      this.settings.enableKafkaLogPublishing === true &&
      (this.settings.kafkaClient === null ||
        this.settings.kafkaClient === undefined)
    ) {
      if (
        this.settings.kafkaConfig !== undefined &&
        this.settings.kafkaConfig !== null
      ) {
        const kafkaClient = await connectKafka(
          this.settings.kafkaConfig.brokerList,
          this.settings.kafkaConfig.clientId
        );

        this.settings.kafkaClient = kafkaClient;
      }
    }
  }

  /**
   * Disconnects the Kafka client if it is connected.
   */
  /**
   * Gracefully disconnects the Kafka client if it exists.
   * @returns {Promise<void>}
   *
   * @example <caption>Basic disconnection</caption>
   * await logger.disconnectKafkaClient();
   *
   * @example <caption>With error handling</caption>
   * try {
   *   await logger.disconnectKafkaClient();
   * } catch (err) {
   *   console.error('Kafka disconnection failed:', err);
   * }
   *
   * @note This method:
   * 1. Checks for an existing Kafka client connection
   * 2. Performs graceful disconnection
   * 3. Sets kafkaClient to null after disconnection
   * 4. Handles errors silently (logs to console)
   *
   * @recommended Call this during application shutdown
   */
  async disconnectKafkaClient() {
    const kafkaClient = this.settings.kafkaClient ?? null;
    if (kafkaClient !== null) {
      disconnectKafka(kafkaClient);
    }
  }

  /**
   * Publishes a log entry to Kafka if Kafka logging is enabled.
   * @param {ProcessLog} obj - The log entry to publish
   *
   * @example <caption>Kafka message format</caption>
   * {
   *   key: config.messageKey,
   *   value: JSON.stringify({
   *     orderId: 42,
   *     sessionId: 'session123',
   *     processId: 'process456',
   *     functionName: 'processPayment',
   *     functionType: 'FUNCTION_CALLED',
   *     body: '{"amount":100}'
   *   })
   * }
   *
   * @note This method:
   * 1. Establishes Kafka connection if needed
   * 2. Serializes the log entry to JSON
   * 3. Publishes to configured topics
   * 4. Handles errors silently (logs to console)
   */
  private async logToKafka(obj: ProcessLog) {
    try {
      await this.connectToKafka();

      const kafkaClient = this.settings.kafkaClient ?? null;
      const kafkaConfig = this.settings.kafkaConfig ?? null;

      if (kafkaClient !== null && kafkaConfig !== null) {
        const messageBody = JSON.stringify(obj);
        const message: Message = {
          key: kafkaConfig.messageKey,
          value: messageBody,
        };
        sendMessage(
          kafkaClient.producer(),
          kafkaConfig.kafkaTopics,
          [message],
          kafkaConfig.disconnectAfterSendingMessage
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  //region OPEN TELEMETRY FUNCTIONS

  /**
   * Initializes OpenTelemetry tracing with the configured settings.
   * @returns {void}
   *
   * @example <caption>Basic initialization</caption>
   * logger.initOpenTelemetryTracing();
   *
   * @example <caption>With error handling</caption>
   * try {
   *   logger.initOpenTelemetryTracing();
   * } catch (err) {
   *   console.error('Failed to initialize tracing:', err);
   *   logger.logException('otelInit', err.message);
   * }
   *
   * @note Requires configuration via LoggerSettings:
   * - enableOpenTelemetryPublishing: true
   * - Valid openTelemetryConfig containing:
   *   - url: Collector endpoint
   *   - scheduledDelayMillis: Export interval
   *   - maxExportBatchSize: Max spans per batch
   *   - maxQueueSize: Max queue size
   *
   * @throws {Error} If configuration is invalid or connection fails
   */
  initOpenTelemetryTracing(): void {
    if (
      this.settings.openTelemetryConfig !== undefined &&
      this.settings.openTelemetryConfig !== null
    ) {
      initTracing(this.settings.openTelemetryConfig);
    }
  }

  /**
   * Gracefully shuts down OpenTelemetry tracing if enabled.
   * @returns {Promise<void>} Resolves when shutdown is complete
   *
   * @example <caption>Shutting down tracing</caption>
   * await logger.shutdownOpenTelemetryTracing();
   *
   * @example <caption>Error handling</caption>
   * try {
   *   await logger.shutdownOpenTelemetryTracing();
   * } catch (err) {
   *   console.error('Failed to shutdown tracing:', err);
   * }
   *
   * @note This method:
   * 1. Flushes any pending spans
   * 2. Releases resources
   * 3. Closes connections
   * 4. Handles errors silently (logs to console)
   */
  async shutdownOpenTelemetryTracing(): Promise<void> {
    await shutdownOpenTelemetryTracing();
  }

  /**
   * Converts a log entry to an OpenTelemetry span if tracing is enabled.
   * @param {ProcessLog} log - The log entry to convert
   *
   * @example <caption>Span creation</caption>
   * logger.logToOpenTelemetry({
   *   functionName: 'processPayment',
   *   functionType: 'FUNCTION_CALLED',
   *   sessionId: 'session123',
   *   processId: 'process456',
   *   orderId: 42,
   *   body: '{"amount":100}'
   * });
   *
   * @note This method:
   * 1. Checks if OpenTelemetry publishing is enabled
   * 2. Initializes tracing if not already done
   * 3. Creates a span with log metadata as attributes:
   *    - function.type: Log category/type
   *    - session.id: Session identifier
   *    - process.id: Process identifier
   *    - order: Log sequence number
   *    - log: The log body content
   * 4. Sets span status to OK
   * 5. Ends the span immediately (no duration tracking)
   *
   * @performance Consider batching spans if high volume
   * @throws {Error} If span creation fails (handled internally)
   */
  logToOpenTelemetry(log: ProcessLog): void {
    try {
      if (this.settings.enableOpenTelemetryPublishing === true) {
        this.initOpenTelemetryTracing();
        const logTracer = trace.getTracer('logger');
        const logSpan = logTracer.startSpan(log.functionName, {
          attributes: {
            'function.type': log.functionType,
            'session.id': log.sessionId,
            'process.id': log.processId,
            order: log.orderId,
            log: log.body,
          },
        });
        logSpan.setStatus({ code: SpanStatusCode.OK });
        logSpan.end();
      }
    } catch (err) {
      console.error('OpenTelemetry error:', err);
    }
  }

  //endregion
  //region ACTUAL LOG FUNCTIONS
  /**
   * Core logging method that handles JSON processing and output routing.
   * @param {string} functionName - Name of the function/operation being logged
   * @param {FunctionType|string} functionType - Category/type of the log entry
   * @param {object} body - Data to log (will be JSON serialized)
   *
   * @example <caption>Error Scenarios</caption>
   * // JSON serialization failure
   * logger.log('process', 'ERROR', { circular: {} });
   * // Output: "TypeError: Converting circular structure to JSON"
   *
   * @example <caption>Recovery Example</caption>
   * try {
   *   logger.log('process', 'ERROR', problematicData);
   * } catch (err) {
   *   logger.log('logger', 'EXCEPTION', {
   *     error: err.message,
   *     originalData: String(problematicData)
   *   });
   * }
   *
   * @throws {TypeError} If JSON.stringify fails on body
   * @throws {Error} If Kafka/OpenTelemetry connections fail when enabled
   */
  private log(
    functionName: string,
    functionType: FunctionType | string,
    body: object
  ): void {
    let loggingBody = body;

    if (!this.logSetValues.processId) {
      this.logSetValues.processId = generateUUID();
    }
    if (!this.logSetValues.sessionId) {
      this.logSetValues.sessionId = generateUUID();
    }

    // For safe logging
    try {
      if (this.settings.enableKeyMasking === true && functionType !== 'DEBUG') {
        const maskingKeys = this.settings.maskingKeys;
        loggingBody = maskKeys(loggingBody, maskingKeys);
      }

      const bodyText = JSON.stringify(loggingBody);
      const log: ProcessLog = {
        orderId: this.logSetValues.orderId,
        sessionId: this.logSetValues.sessionId,
        processId: this.logSetValues.processId,
        functionName,
        functionType,
        body: bodyText,
      };

      // direct logging
      this.directLog(log);

      //log to kafka
      this.logToKafka(log);

      //log to open telemetry
      this.logToOpenTelemetry(log);
    } catch (err) {
      console.error(String(err));
    }
    this.logSetValues.orderId++;
  }

  //region MAIN LOGGER METHODS

  /**
   * Logs when a function is called, including its input parameters.
   * @param {string} functionName - Name of the called function.
   * @param {object} body - Function parameters/input as JSON-serializable object.
   *
   * @example <caption>Logging a function call</caption>
   * logger.logFunctionCalled('processPayment', {
   *   amount: 100,
   *   currency: 'USD',
   *   customer: {
   *     id: 'cust123',
   *     tier: 'premium'
   *   }
   * });
   *
   * @note The body object will be:
   * 1. Masked according to logger settings
   * 2. Published to configured outputs (console, Kafka, OpenTelemetry)
   * 3. Stored with timestamp and call context
   */
  logFunctionCalled(functionName: string, body: object) {
    this.log(functionName, 'FUNCTION_CALLED', body);
  }

  /**
   * Logs the result of a function call, including output data.
   * @param {string} functionName - Name of the function that returned.
   * @param {object} result - Function return value as JSON-serializable object.
   *
   * @example <caption>Logging a function result</caption>
   * logger.logFunctionCallResult('processPayment', {
   *   success: true,
   *   transactionId: 'txn_123',
   *   processingTime: 42
   * });
   *
   * @note The result object will be:
   * 1. Masked according to logger settings
   * 2. Published to configured outputs
   * 3. Stored with execution context
   */
  logFunctionCallResult(functionName: string, result: object) {
    this.log(functionName, 'FUNCTION_CALL_RESULT', result);
  }

  /**
   * Logs informational messages about function operations.
   * @param {string} functionName - Name of the function being logged
   * @param {object} info - Additional information as JSON-serializable object
   *
   * @example <caption>Basic info logging</caption>
   * logger.logFunctionInfo('processPayment', {
   *   status: 'started',
   *   itemsProcessed: 42,
   *   memoryUsage: '1.2GB'
   * });
   *
   * @example <caption>With performance metrics</caption>
   * logger.logFunctionInfo('dataTransform', {
   *   duration: 142,
   *   rowsProcessed: 1000,
   *   throughput: '700 rows/sec'
   * });
   *
   * @note Info logs are typically used for:
   * - Operation progress updates
   * - Performance metrics
   * - Non-critical status changes
   * - Debugging information
   */
  logFunctionInfo(functionName: string, info: object) {
    this.log(functionName, 'FUNCTION_INFO', info);
  }

  /**
   * Logs an outgoing request to an external API.
   * @param {string} apiName - Name/identifier of the external API.
   * @param {object} request - API request details as JSON-serializable object.
   *
   * @example <caption>Logging an API request</caption>
   * logger.logExternalApiRequest('PaymentGateway', {
   *   method: 'POST',
   *   url: 'https://api.payments.com/charge',
   *   headers: {
   *     'Content-Type': 'application/json',
   *     'Authorization': 'Bearer token123'
   *   },
   *   body: {
   *     amount: 100,
   *     currency: 'USD'
   *   }
   * });
   *
   * @note The request object should include:
   * - HTTP method
   * - URL
   * - Headers (will be masked if sensitive)
   * - Request body/payload
   */
  logExternalApiRequest(apiName: string, request: object) {
    this.log(apiName, 'EXTERNAL_API_REQUEST', request);
  }

  /**
   * Logs a response from an external API.
   * @param {string} apiName - Name/identifier of the external API.
   * @param {object} response - API response details as JSON-serializable object.
   *
   * @example <caption>Logging an API response</caption>
   * logger.logExternalApiResponse('PaymentGateway', {
   *   status: 200,
   *   statusText: 'OK',
   *   headers: {
   *     'Content-Type': 'application/json'
   *   },
   *   body: {
   *     transactionId: 'txn_123',
   *     status: 'completed'
   *   },
   *   duration: 142
   * });
   *
   * @note The response object should include:
   * - HTTP status code
   * - Status text
   * - Headers
   * - Response body
   * - Duration in ms (optional)
   */
  logExternalApiResponse(apiName: string, response: object) {
    this.log(apiName, 'EXTERNAL_API_RESPONSE', response);
  }

  /**
   * Logs informational messages about external API operations.
   * @param {string} apiName - Name/identifier of the external API
   * @param {object} info - API-related information as JSON-serializable object
   *
   * @example <caption>Logging API status</caption>
   * logger.logExternalApiInfo('PaymentGateway', {
   *   status: 'rate_limited',
   *   retryAfter: 60,
   *   endpoint: '/process'
   * });
   *
   * @example <caption>Logging API metrics</caption>
   * logger.logExternalApiInfo('UserService', {
   *   calls: 142,
   *   avgDuration: 120,
   *   errors: 3
   * });
   *
   * @note Use this for:
   * - Status changes (rate limits, downtime etc.)
   * - Performance metrics
   * - Non-error operational information
   * - Configuration changes
   */
  logExternalApiInfo(apiName: string, info: object) {
    this.log(apiName, 'EXTERNAL_API_INFO', info);
  }

  /**
   * Logs an exception/error with context.
   * @param {string} functionName - Name of function where error occurred
   * @param {string|Error} error - Error message or Error object
   *
   * @example <caption>Basic error logging</caption>
   * logger.logException('processPayment', 'Invalid currency');
   *
   * @example <caption>With Error object</caption>
   * try {
   *   riskyOperation();
   * } catch (err) {
   *   logger.logException('processPayment', err);
   * }
   *
   * @note The error will be:
   * - Logged with EXCEPTION type
   * - Published to all configured outputs
   * - Masked according to settings
   * - Includes stack trace if Error object provided
   */
  logException(functionName: string, error: string | Error) {
    const errorObj =
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
          }
        : { message: error };

    this.log(functionName, 'EXCEPTION', {
      error: errorObj,
    });
  }

  /**
   * Logs an incoming server request.
   * @param {string} endpoint - The endpoint/route being requested.
   * @param {object} request - Request details as JSON-serializable object.
   *
   * @example <caption>Logging a server request</caption>
   * logger.logServerRequest('/api/payments', {
   *   method: 'POST',
   *   headers: {
   *     'Content-Type': 'application/json',
   *     'Authorization': 'Bearer token123'
   *   },
   *   body: {
   *     amount: 100,
   *     currency: 'USD'
   *   },
   *   ip: '192.168.1.1'
   * });
   *
   * @note The request object should include:
   * - HTTP method
   * - Headers (will be masked if sensitive)
   * - Request body
   * - Client IP address
   * - Any other relevant metadata
   */
  logServerRequest(endpoint: string, request: object) {
    this.log(endpoint, 'SERVER_REQUEST', request);
  }

  /**
   * Logs a server response before sending to client.
   * @param {string} endpoint - The endpoint/route that handled the request.
   * @param {object} response - Response details as JSON-serializable object.
   *
   * @example <caption>Logging a server response</caption>
   * logger.logServerResponse('/api/payments', {
   *   status: 201,
   *   headers: {
   *     'Content-Type': 'application/json'
   *   },
   *   body: {
   *     transactionId: 'txn_123',
   *     status: 'completed'
   *   },
   *   duration: 142
   * });
   *
   * @note The response object can include:
   * - HTTP status code
   * - Response headers
   * - Response body
   * - Processing duration in ms
   */
  logServerResponse(endpoint: string, response: object) {
    this.log(endpoint, 'SERVER_RESPONSE', response);
  }

  /**
   * Logs informational messages about server operations.
   * @param {string} endpoint - The endpoint/route related to the info.
   * @param {object} info - Additional information as JSON-serializable object.
   *
   * @example <caption>Logging server metrics</caption>
   * logger.logServerInfo('/api/payments', {
   *   requestCount: 142,
   *   avgResponseTime: 120,
   *   errorRate: 0.03
   * });
   *
   * @example <caption>Logging route info</caption>
   * logger.logServerInfo('/api/users', {
   *   action: 'maintenance_mode',
   *   status: 'enabled',
   *   expectedDowntime: '5 minutes'
   * });
   *
   * @note Use this for:
   * - Server performance metrics
   * - Operational status changes
   * - Non-critical notifications
   * - Maintenance/schedule information
   *
   * @warning Avoid logging sensitive server configuration details
   */
  logServerInfo(endpoint: string, info: object) {
    this.log(endpoint, 'SERVER_INFO', info);
  }

  /**
   * Logs a database query request before execution.
   * @param {string} query - The database query string.
   * @param {object} parameters - Query parameters as JSON-serializable object.
   *
   * @example <caption>Logging a DB query</caption>
   * logger.logDbQueryRequest(
   *   'SELECT * FROM users WHERE id = ?',
   *   { parameters: [123], connection: 'read-replica' }
   * );
   *
   * @note The parameters object should include:
   * - Query parameters (array or object)
   * - Connection/transaction details (optional)
   * - Any other relevant metadata
   */
  logDbQueryRequest(query: string, parameters: object) {
    this.log(query, 'DB_QUERY_REQUEST', parameters);
  }

  /**
   * Logs the results of a database query after execution.
   * @param {string} query - The database query that was executed.
   * @param {object} response - Query results as JSON-serializable object.
   *
   * @example <caption>Logging query results</caption>
   * logger.logDbQueryResponse(
   *   'SELECT * FROM users WHERE id = ?',
   *   {
   *     rows: [{id: 123, name: 'John'}],
   *     rowCount: 1,
   *     duration: 24
   *   }
   * );
   *
   * @note The response object should include:
   * - Result rows/objects
   * - Row count
   * - Execution duration (optional)
   * - Any error information if applicable
   */
  logDbQueryResponse(query: string, response: object) {
    this.log(query, 'DB_QUERY_RESPONSE', response);
  }

  /**
   * Logs informational messages about database operations.
   * @param {string} query - The database query/operation.
   * @param {object} info - Additional information as JSON-serializable object.
   *
   * @example <caption>Logging query metrics</caption>
   * logger.logDbQueryInfo('SELECT * FROM users', {
   *   executionPlan: 'INDEX_SCAN',
   *   rowCount: 1000,
   *   duration: 42
   * });
   *
   * @example <caption>Logging connection info</caption>
   * logger.logDbQueryInfo('CONNECT', {
   *   database: 'users_db',
   *   host: 'db-primary',
   *   poolSize: 10
   * });
   *
   * @note Use this for:
   * - Query execution metrics
   * - Connection pool information
   * - Schema changes
   * - Non-error operational details
   *
   * @warning Avoid logging sensitive connection details or raw data
   */
  logDbQueryInfo(query: string, info: object) {
    this.log(query, 'DB_QUERY_INFO', info);
  }

  /**
   * Logs a Redis query request before execution.
   * @param {string} query - The Redis command/query.
   * @param {object} parameters - Query parameters as JSON-serializable object.
   *
   * @example <caption>Logging a Redis query</caption>
   * logger.logRedisQueryRequest('HGETALL', {
   *   key: 'user:123',
   *   connection: 'cache-1'
   * });
   *
   * @note The parameters object should include:
   * - Key/pattern being accessed
   * - Connection details (optional)
   * - Any other relevant metadata
   */
  logRedisQueryRequest(query: string, parameters: object) {
    this.log(query, 'REDIS_QUERY_REQUEST', parameters);
  }

  /**
   * Logs the results of a Redis query after execution.
   * @param {string} query - The Redis command that was executed.
   * @param {object} result - Query results as JSON-serializable object.
   *
   * @example <caption>Logging Redis results</caption>
   * logger.logRedisQueryResult('HGETALL', {
   *   key: 'user:123',
   *   value: {name: 'John', age: 30},
   *   duration: 5
   * });
   *
   * @note The result object should include:
   * - The key accessed
   * - Retrieved value(s)
   * - Execution duration in ms (optional)
   */
  logRedisQueryResult(query: string, result: object) {
    this.log(query, 'REDIS_QUERY_RESULT', result);
  }

  /**
   * Logs informational messages about Redis operations.
   * @param {string} query - The Redis command/operation.
   * @param {object} info - Additional information as JSON-serializable object.
   *
   * @example <caption>Logging Redis stats</caption>
   * logger.logRedisQueryInfo('INFO', {
   *   memoryUsed: '1.2MB',
   *   keys: 1420,
   *   connectedClients: 3
   * });
   *
   * @example <caption>Logging Redis cluster info</caption>
   * logger.logRedisQueryInfo('CLUSTER INFO', {
   *   state: 'ok',
   *   slotsAssigned: 16384,
   *   slotsOk: 16384
   * });
   *
   * @note Use this for:
   * - Redis server statistics
   * - Cluster health information
   * - Configuration changes
   * - Non-error operational details
   *
   * @warning Avoid logging sensitive configuration details
   */
  logRedisQueryInfo(query: string, info: object) {
    this.log(query, 'REDIS_QUERY_INFO', info);
  }

  /**
   * Logs debug information with full details.
   * @param {string} message - Debug message/title.
   * @param {object} data - Debug data as JSON-serializable object.
   *
   * @example <caption>Debug logging</caption>
   * logger.logDebug('Cache state', {
   *   hits: 42,
   *   misses: 3,
   *   size: '1.2MB',
   *   entries: ['user:123', 'product:456']
   * });
   *
   * @note Debug logs are not masked by default, so avoid sensitive data.
   */
  logDebug(message: string, data: object) {
    this.log(message, 'DEBUG', data);
  }

  //endregion
}

export default ProcessLogger;
