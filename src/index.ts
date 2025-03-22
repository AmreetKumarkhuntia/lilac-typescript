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
import { NodeSDK } from '@opentelemetry/sdk-node';
import { initTracing } from './openTelemetry/index.ts';
import { SpanStatusCode, trace } from '@opentelemetry/api';

/**
 * ProcessLogger class for logging process information.
 * Allows customization of the display order and color settings.
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
    //all open telemetry settings
    enableOpenTelemetryPublishing: false,
    openTelemetryURL: undefined,
    openTelemetrySDK: undefined,
  };

  /**
   * Values used to track order, session, and process IDs.
   */
  logSetValues: LogSetValues = {
    orderId: 0,
    sessionId: null,
    processId: null,
  };

  //region CONSTRUCTOR

  /**
   * Constructor to initialize the logger with custom settings.
   * @param {Partial<LoggerSettings>} settings - Optional custom settings.
   * Allows overriding default settings by passing custom values.
   * Automatically generates a session ID during instantiation.
   */
  constructor(settings?: Partial<LoggerSettings>) {
    if (settings) {
      for (const key in settings) {
        if (this.settings.hasOwnProperty(key)) {
          this.settings[key] = settings[key];
        }
      }
    }
    this.logSetValues.sessionId = generateUUID();
  }

  //region DIRECT LOG

  /**
   * Logs process information directly based on the provided object.
   * @param {Record<string, any>} obj - Object containing process info.
   * Logs fields in the order specified by the `displayOrder` setting.
   * Supports adding timestamps, colors, and separators between fields.
   */
  private directLog(obj: ProcessLog): void {
    let printString = '';
    const size = this.settings.displayOrder.length;

    for (let i = 0; i < size; i++) {
      const setting = this.settings.displayOrder[i];
      const key = keyToSettingMap[setting];
      if (key === undefined) continue;
      const nextKey =
        i + 1 < size
          ? keyToSettingMap[this.settings.displayOrder[i + 1]]
          : null;

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
   * Connects to Kafka if Kafka log publishing is enabled and a client is not already connected.
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
  async disconnectKafkaClient() {
    const kafkaClient = this.settings.kafkaClient ?? null;
    if (kafkaClient !== null) {
      disconnectKafka(kafkaClient);
    }
  }

  /**
   * Logs the provided process log object to Kafka, if Kafka logging is enabled.
   * @param {ProcessLog} obj - The process log object to send to Kafka.
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
   * Initializes tracing for the application if the OpenTelemetry URL is defined.
   * This function checks the settings for the OpenTelemetry URL and, if present,
   * initializes the OpenTelemetry SDK using that URL.
   *
   * @async
   * @function initTracing
   * @returns {Promise<void>} A promise that resolves when the OpenTelemetry SDK
   *                          is successfully initialized.
   */
  async initOpenTelemetryTracing(): Promise<void> {
    if (this.settings.openTelemetryURL !== undefined) {
      this.settings.openTelemetrySDK = await initTracing(
        this.settings.openTelemetryURL
      );
    }
  }

  /**
   * Shuts down the tracing for the provided NodeSDK instance.
   * This function calls the shutdown method on the NodeSDK,
   * which is responsible for cleaning up resources and stopping
   * any ongoing tracing activities.
   *
   * @async
   * @function shutdownTracing
   * @param {NodeSDK} nodeSdk - The instance of NodeSDK to be shut down.
   * @returns {Promise<void>} A promise that resolves when the shutdown
   *                          process is complete.
   */
  async shutdownOpenTelemetryTracing(nodeSdk: NodeSDK): Promise<void> {
    try {
      await nodeSdk.shutdown();
    } catch (err) {
      console.error('Encountered Exception:', String(err));
    }
  }

  /**
   * Logs information to OpenTelemetry if publishing is enabled.
   * This function checks the settings to determine if OpenTelemetry
   * publishing is enabled and if the OpenTelemetry SDK is available.
   * If both conditions are met, it initializes tracing and creates
   * a span for the log entry, setting its attributes based on the
   * provided log information.
   *
   * @async
   * @function logToOpenTelemetry
   * @param {ProcessLog} log - The log object containing details
   *                            about the function execution.
   * @returns {Promise<void>} A promise that resolves when the log
   *                          has been processed or if an error occurs.
   */
  async logToOpenTelemetry(log: ProcessLog): Promise<void> {
    try {
      const openTelemetrySdk = this.settings.openTelemetrySDK;
      if (
        this.settings.enableOpenTelemetryPublishing === true &&
        openTelemetrySdk !== undefined
      ) {
        await this.initOpenTelemetryTracing();
        const logSpan = trace.getTracer('logger').startSpan(log.functionName, {
          attributes: {
            'function.type': log.functionType,
            'session.id': log.sessionId,
            'process.id': log.processId,
            order: log.orderId,
            log: log.body,
          },
        });

        logSpan.setStatus({ code: SpanStatusCode.OK });
      }
    } catch (err) {
      console.error('Encountered Exception:', String(err));
    }
  }

  //endregion
  //region ACTUAL LOG FUNCTIONS
  /**
   * Logs detailed information with preset values.
   * @param {string} functionName - Name of the function being logged.
   * @param {FunctionType | string} functionType - Type/category of the function.
   * @param {object} body - Additional data to be logged.
   * Automatically generates process and session IDs if not set.
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
      console.log(String(err));
    }
    this.logSetValues.orderId++;
  }

  //region Logger Functions
  //region MAIN LOGGER METHODS

  logFunctionCalled(functionName: string, body: object) {
    this.log(functionName, 'FUNCTION_CALLED', body);
  }

  logFunctionCallResult(functionName: string, result: object) {
    this.log(functionName, 'FUNCTION_CALL_RESULT', result);
  }

  logFunctionInfo(functionName: string, info: object) {
    this.log(functionName, 'FUNCTION_INFO', info);
  }

  logExternalApiRequest(apiName: string, request: object) {
    this.log(apiName, 'EXTERNAL_API_REQUEST', request);
  }

  logExternalApiResponse(apiName: string, response: object) {
    this.log(apiName, 'EXTERNAL_API_RESPONSE', response);
  }

  logExternalApiInfo(apiName: string, info: object) {
    this.log(apiName, 'EXTERNAL_API_INFO', info);
  }

  logException(functionName: string, error: string) {
    this.log(functionName, 'EXCEPTION', {
      error,
    });
  }

  logServerRequest(endpoint: string, request: object) {
    this.log(endpoint, 'SERVER_REQUEST', request);
  }

  logServerResponse(endpoint: string, response: object) {
    this.log(endpoint, 'SERVER_RESPONSE', response);
  }

  logServerInfo(endpoint: string, info: object) {
    this.log(endpoint, 'SERVER_INFO', info);
  }

  logDbQueryRequest(query: string, parameters: object) {
    this.log(query, 'DB_QUERY_REQUEST', parameters);
  }

  logDbQueryResponse(query: string, response: object) {
    this.log(query, 'DB_QUERY_RESPONSE', response);
  }

  logDbQueryInfo(query: string, info: object) {
    this.log(query, 'DB_QUERY_INFO', info);
  }

  logRedisQueryRequest(query: string, parameters: object) {
    this.log(query, 'REDIS_QUERY_REQUEST', parameters);
  }

  logRedisQueryResult(query: string, result: object) {
    this.log(query, 'REDIS_QUERY_RESULT', result);
  }

  logRedisQueryInfo(query: string, info: object) {
    this.log(query, 'REDIS_QUERY_INFO', info);
  }

  logDebug(message: string, data: object) {
    this.log(message, 'DEBUG', data);
  }

  //endregion
}

export default ProcessLogger;
