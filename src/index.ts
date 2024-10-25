import type {
  FunctionType,
  LoggerSettings,
  LogSetValues,
  ProcessLog,
} from './types.ts';
import {
  defaultDisplaySettings,
  keyToSettingMap,
  colorsMap,
  defaultKeyColorMap,
  defaultSeparator,
  defaultMaskingKeys,
} from './defaults.ts';
import { generateUUID, formatTimestamp, maskKeys } from './utils.ts';

/**
 * * ProcessLogger class for logging process information.
 * * Allows customization of the display order and color settings.
 */
export class ProcessLogger {
  /**
   * * Default logger settings for format and behavior.
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
  };

  /**
   * * Values used to track order, session, and process IDs.
   */
  logSetValues: LogSetValues = {
    orderId: 0,
    sessionId: null,
    processId: null,
  };

  /**
   * * Constructor to initialize the logger with custom settings.
   * @param {Partial<LoggerSettings>} settings - Optional custom settings.
   * * Allows overriding default settings by passing custom values.
   * * Automatically generates a session ID during instantiation.
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

  /**
   * * Logs process information directly based on the provided object.
   * @param {Record<string, any>} obj - Object containing process info.
   * * Logs fields in the order specified by the `displayOrder` setting.
   * * Supports adding timestamps, colors, and separators between fields.
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

      printString += this.settings.colorsMap[key].fgColor;
      printString += this.settings.colorsMap[key].bgColor;

      if (this.settings.enablePrintSpaceBetweenLogKeys && i !== 0) {
        printString += ' ' + val;
      } else {
        printString += val;
      }
      if (this.settings.enablePrintSpaceBetweenLogKeys) {
        printString += ' ';
      }

      printString += colorsMap.reset;

      if (i < size - 1 && this.settings.enablePrintSeparator) {
        printString += this.settings.colorsMap[key].fgComplementary;
        if (nextKey) {
          printString += this.settings.colorsMap[nextKey].bgColor;
        }
        printString += this.settings.printSeparator;
      }
      printString += colorsMap.reset;
    }
    console.log(printString);
  }

  /**
   * * Logs detailed information with preset values.
   * @param {string} functionName - Name of the function being logged.
   * @param {FunctionType | string} functionType - Type/category of the function.
   * @param {object} body - Additional data to be logged.
   * * Automatically generates process and session IDs if not set.
   */
  log(
    functionName: string,
    functionType: FunctionType | string,
    body: object
  ): void {
    let loggingBody = body;

    if (this.settings.enableKeyMasking === true && functionType !== 'DEBUG') {
      const maskingKeys = this.settings.maskingKeys;
      loggingBody = maskKeys(loggingBody, maskingKeys);
    }

    if (!this.logSetValues.processId) {
      this.logSetValues.processId = generateUUID();
    }
    if (!this.logSetValues.sessionId) {
      this.logSetValues.sessionId = generateUUID();
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

    this.directLog(log);
    this.logSetValues.orderId++;
  }

  /**
   * Logs the invocation of a function with the specified name and additional details.
   *
   * @param {string} functionName - The name of the function being logged.
   * @param {object} body - An object containing additional details or context about the function call.
   */
  logFunctionCalled(functionName: string, body: object) {
    this.log(functionName, 'FUNCTION_CALLED', body);
  }

  /**
   * Logs the result of a function call with the specified name and result details.
   *
   * @param {string} functionName - The name of the function being logged.
   * @param {object} result - An object containing the result of the function call.
   */
  logFunctionCallResult(functionName: string, result: object) {
    this.log(functionName, 'FUNCTION_CALL_RESULT', result);
  }

  /**
   * Logs information about a function with the specified name.
   *
   * @param {string} functionName - The name of the function being logged.
   * @param {object} info - An object containing additional information about the function.
   */
  logFunctionInfo(functionName: string, info: object) {
    this.log(functionName, 'FUNCTION_INFO', info);
  }

  /**
   * Logs a request to an external API with the specified name and request details.
   *
   * @param {string} apiName - The name of the external API being called.
   * @param {object} request - An object containing the details of the API request.
   */
  logExternalApiRequest(apiName: string, request: object) {
    this.log(apiName, 'EXTERNAL_API_REQUEST', request);
  }

  /**
   * Logs the response from an external API with the specified name and response details.
   *
   * @param {string} apiName - The name of the external API being called.
   * @param {object} response - An object containing the details of the API response.
   */
  logExternalApiResponse(apiName: string, response: object) {
    this.log(apiName, 'EXTERNAL_API_RESPONSE', response);
  }

  /**
   * Logs information about an external API with the specified name.
   *
   * @param {string} apiName - The name of the external API being logged.
   * @param {object} info - An object containing additional information about the API.
   */
  logExternalApiInfo(apiName: string, info: object) {
    this.log(apiName, 'EXTERNAL_API_INFO', info);
  }

  /**
   * Logs an exception that occurred within a function.
   *
   * @param {string} functionName - The name of the function where the exception occurred.
   * @param {Error} error - The error object containing details of the exception.
   */
  logException(functionName: string, error: string) {
    this.log(functionName, 'EXCEPTION', {
      error,
    });
  }

  /**
   * Logs a request to a server endpoint with the specified details.
   *
   * @param {string} endpoint - The name of the server endpoint being called.
   * @param {object} request - An object containing the details of the server request.
   */
  logServerRequest(endpoint: string, request: object) {
    this.log(endpoint, 'SERVER_REQUEST', request);
  }

  /**
   * Logs the response from a server endpoint with the specified details.
   *
   * @param {string} endpoint - The name of the server endpoint being called.
   * @param {object} response - An object containing the details of the server response.
   */
  logServerResponse(endpoint: string, response: object) {
    this.log(endpoint, 'SERVER_RESPONSE', response);
  }

  /**
   * Logs information about a server endpoint.
   *
   * @param {string} endpoint - The name of the server endpoint being logged.
   * @param {object} info - An object containing additional information about the server.
   */
  logServerInfo(endpoint: string, info: object) {
    this.log(endpoint, 'SERVER_INFO', info);
  }

  /**
   * Logs a database query request with the specified query and parameters.
   *
   * @param {string} query - The database query being executed.
   * @param {object} parameters - An object containing the parameters for the query.
   */
  logDbQueryRequest(query: string, parameters: object) {
    this.log(query, 'DB_QUERY_REQUEST', parameters);
  }

  /**
   * Logs the response from a database query with the specified query and response details.
   *
   * @param {string} query - The database query being executed.
   * @param {object} response - An object containing the details of the database response.
   */
  logDbQueryResponse(query: string, response: object) {
    this.log(query, 'DB_QUERY_RESPONSE', response);
  }

  /**
   * Logs information about a database query.
   *
   * @param {string} query - The database query being logged.
   * @param {object} info - An object containing additional information about the query.
   */
  logDbQueryInfo(query: string, info: object) {
    this.log(query, 'DB_QUERY_INFO', info);
  }

  /**
   * Logs a request to a Redis database with the specified query and parameters.
   *
   * @param {string} query - The Redis query being executed.
   * @param {object} parameters - An object containing the parameters for the query.
   */
  logRedisQueryRequest(query: string, parameters: object) {
    this.log(query, 'REDIS_QUERY_REQUEST', parameters);
  }

  /**
   * Logs the result from a Redis query with the specified query and result details.
   *
   * @param {string} query - The Redis query being executed.
   * @param {object} result - An object containing the result of the Redis query.
   */
  logRedisQueryResult(query: string, result: object) {
    this.log(query, 'REDIS_QUERY_RESULT', result);
  }

  /**
   * Logs information about a Redis query.
   *
   * @param {string} query - The Redis query being logged.
   * @param {object} info - An object containing additional information about the query.
   */
  logRedisQueryInfo(query: string, info: object) {
    this.log(query, 'REDIS_QUERY_INFO', info);
  }

  /**
   * Logs a debug message with additional data.
   *
   * @param {string} message - The debug message to be logged.
   * @param {object} data - An object containing additional data related to the debug message.
   */
  logDebug(message: string, data: object) {
    this.log(message, 'DEBUG', data);
  }
}

export default ProcessLogger;
