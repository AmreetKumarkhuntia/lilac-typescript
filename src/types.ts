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
 * * Type for ANSI escape codes used in colorsMap.
 */
export type AnsiColorCode = string;

/**
 * * Type for the colors map containing foreground and background colors.
 */

export type ColorsMap = {
  reset: AnsiColorCode;
  bright: AnsiColorCode;
  dim: AnsiColorCode;
  underscore: AnsiColorCode;
  blink: AnsiColorCode;
  reverse: AnsiColorCode;
  hidden: AnsiColorCode;
  bold: AnsiColorCode;
  italic: AnsiColorCode;
  strikethrough: AnsiColorCode;
  fg: {
    black: AnsiColorCode;
    red: AnsiColorCode;
    green: AnsiColorCode;
    yellow: AnsiColorCode;
    blue: AnsiColorCode;
    magenta: AnsiColorCode;
    cyan: AnsiColorCode;
    white: AnsiColorCode;
    gray: AnsiColorCode;
    darkGray: AnsiColorCode;
    darkRed: AnsiColorCode;
    darkGreen: AnsiColorCode;
    darkYellow: AnsiColorCode;
    darkBlue: AnsiColorCode;
    darkMagenta: AnsiColorCode;
    darkCyan: AnsiColorCode;
    darkWhite: AnsiColorCode;
    brightRed: AnsiColorCode;
    brightGreen: AnsiColorCode;
    brightYellow: AnsiColorCode;
    brightBlue: AnsiColorCode;
    brightMagenta: AnsiColorCode;
    brightCyan: AnsiColorCode;
    brightWhite: AnsiColorCode;
    purple: AnsiColorCode;
    lightPurple: AnsiColorCode;
    teal: AnsiColorCode;
    coral: AnsiColorCode;
    gold: AnsiColorCode;
    lavender: AnsiColorCode;
    peach: AnsiColorCode;
    olive: AnsiColorCode;
    darkOlive: AnsiColorCode;
    [key: string]: AnsiColorCode; // Allow additional keys
  };
  bg: {
    black: AnsiColorCode;
    red: AnsiColorCode;
    green: AnsiColorCode;
    yellow: AnsiColorCode;
    blue: AnsiColorCode;
    magenta: AnsiColorCode;
    cyan: AnsiColorCode;
    white: AnsiColorCode;
    gray: AnsiColorCode;
    darkGray: AnsiColorCode;
    darkRed: AnsiColorCode;
    darkGreen: AnsiColorCode;
    darkYellow: AnsiColorCode;
    darkBlue: AnsiColorCode;
    darkMagenta: AnsiColorCode;
    darkCyan: AnsiColorCode;
    darkWhite: AnsiColorCode;
    brightRed: AnsiColorCode;
    brightGreen: AnsiColorCode;
    brightYellow: AnsiColorCode;
    brightBlue: AnsiColorCode;
    brightMagenta: AnsiColorCode;
    brightCyan: AnsiColorCode;
    brightWhite: AnsiColorCode;
    purple: AnsiColorCode;
    lightPurple: AnsiColorCode;
    teal: AnsiColorCode;
    coral: AnsiColorCode;
    gold: AnsiColorCode;
    lavender: AnsiColorCode;
    peach: AnsiColorCode;
    olive: AnsiColorCode;
    darkOlive: AnsiColorCode;
    [key: string]: AnsiColorCode; // Allow additional keys
  };
  [key: string]: any; // Allow additional root-level keys
};

/**
 * * Type for key-color mappings in defaultKeyColorMap.
 */
export type KeyColorMap = Record<LogKey, ColorSet>;

/**
 * * Type for the month strings.
 */
export type Month =
  | 'January'
  | 'February'
  | 'March'
  | 'April'
  | 'May'
  | 'June'
  | 'July'
  | 'August'
  | 'September'
  | 'October'
  | 'November'
  | 'December';

/**
 * * Type for special characters used in logging or display.
 */
export type SpecialCharacter =
  | 'rightArrow'
  | 'leftArrow'
  | 'upArrow'
  | 'downArrow'
  | 'leftRightArrow'
  | 'upDownArrow'
  | 'upRightArrow'
  | 'upLeftArrow'
  | 'downRightArrow'
  | 'downLeftArrow'
  | 'rightDoubleArrow'
  | 'leftRightDoubleArrow'
  | 'upDoubleArrow'
  | 'downDoubleArrow'
  | 'heavyRightArrow'
  | 'horizontalLine'
  | 'verticalLine'
  | 'topLeftCorner'
  | 'topRightCorner'
  | 'bottomLeftCorner'
  | 'bottomRightCorner'
  | 'leftTShape'
  | 'rightTShape'
  | 'tShapeDown'
  | 'tShapeUp'
  | 'crossShape'
  | 'doubleHorizontalLine'
  | 'doubleVerticalLine'
  | 'doubleTopLeftCorner'
  | 'doubleTopRightCorner'
  | 'doubleBottomLeftCorner'
  | 'doubleBottomRightCorner'
  | 'doubleLeftTShape'
  | 'doubleRightTShape'
  | 'doubleCrossShape'
  | 'transitionArrow';

/**
 * * Type for color settings used in the logger.
 */
export type ColorSet = {
  fgColor: string; // Foreground color.
  bgColor: string; // Background color.
  fgComplementary: string; // Complementary foreground color.
  bgComplementary: string; // Complementary background color.
};

/**
 * * Type for logger settings configuration.
 * ? Defines how the logger will behave and format logs.
 */
export type LoggerSettings = {
  displayOrder: string[]; // Order of log fields.
  colorsMap: Record<string, ColorSet>; // Color settings for each log field.
  enablePrintSeparator: boolean; // Enables/disables separator between logs.
  printSeparator: string; // Character/string to use as separator.
  enablePrintSpaceBetweenLogKeys: boolean; // Adds space between fields if true.
  enableLogCounterIncrement: boolean; // Auto-increments log counter.
  maskingKeys: Set<string>; // masking keys
  enableKeyMasking: boolean; // Enables/disables masking keys
};

/**
 * * Type for tracking log details like session and process IDs.
 */
export type LogSetValues = {
  orderId: number; // Unique identifier for log entries.
  sessionId: string | null; // Session ID, generated automatically.
  processId: string | null; // Process ID, generated automatically.
};

/**
 * * Type defining a log entry structure.
 */
export type ProcessLog = {
  orderId: number; // Order of the log entry.
  sessionId: string; // Session ID associated with the log.
  processId: string; // Process ID associated with the log.
  functionName: string; // Name of the logged function.
  functionType: FunctionType | string; // Category/type of the logged function.
  body: string; // Additional log information in JSON format.
};

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
