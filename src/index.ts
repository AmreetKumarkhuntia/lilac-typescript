import type {
  LoggerSettings,
  LogSetValues,
  ProcessLog,
} from "./types.ts";
import {
  defaultDisplaySettings,
  keyToSettingMap,
  colorsMap,
  defaultKeyColorMap,
  defaultSeparator,
} from "./defaults.ts";
import { generateUUID, formatTimestamp } from "./utils.ts";

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
    enablePrintSeparator: true,
    printSeparator: defaultSeparator,
    enablePrintSpaceBetweenLogKeys: true,
    enableLogCounterIncrement: true,
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
          (this.settings as any)[key] = settings[key];
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
  directLog(obj: ProcessLog): void {
    let printString = "";
    const size = this.settings.displayOrder.length;

    for (let i = 0; i < size; i++) {
      const setting = this.settings.displayOrder[i];
      const key = keyToSettingMap[setting];
      const nextKey =
        i + 1 < size
          ? keyToSettingMap[this.settings.displayOrder[i + 1]]
          : null;

      let val = setting !== "TIME" ? obj[key] ?? "null" : formatTimestamp();

      printString += this.settings.colorsMap[key].fgColor;
      printString += this.settings.colorsMap[key].bgColor;

      if (this.settings.enablePrintSpaceBetweenLogKeys && i !== 0) {
        printString += " " + val;
      } else {
        printString += val;
      }
      if (this.settings.enablePrintSpaceBetweenLogKeys) {
        printString += " ";
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
   * @param {string} functionType - Type/category of the function.
   * @param {object} body - Additional data to be logged.
   * * Automatically generates process and session IDs if not set.
   */
  logWithSetValues(functionName: string, functionType: string, body: object): void {
    const bodyText = JSON.stringify(body);

    if (!this.logSetValues.processId) {
      this.logSetValues.processId = generateUUID();
    }
    if (!this.logSetValues.sessionId) {
      this.logSetValues.sessionId = generateUUID();
    }

    const log: ProcessLog = {
      orderId: this.logSetValues.orderId,
      sessionId: this.logSetValues.sessionId,
      processId: this.logSetValues.processId,
      functionName,
      type: functionType,
      body: bodyText,
    };

    this.directLog(log);
    this.logSetValues.orderId++;
  }

}

export default ProcessLogger;
