import type { ColorsMap, KeyColorMap, LogField, LogKey, Month, SpecialCharacter } from "./types.ts";

/**
 * * Contains default display settings.
 * & Default order decides which parameters are displayed when.
 */

export const defaultDisplaySettings: LogField[] = [
  "TIME", // Display time
  "ORDERID", // Display order ID
  "SESSIONID", // Display session ID
  "PROCESSID", // Display process ID
  "FUNCTIONNAME", // Display function name
  "TYPE", // Display type
  "BODY", // Display body
];

/**
 * * Contains key map.
 * & Maps display settings keys to corresponding object keys.
 */

export const keyToSettingMap: Record<LogField, LogKey> = {
  ORDERID: "orderId", // Map ORDERID setting to orderId object key
  SESSIONID: "sessionId", // Map SESSIONID setting to sessionId object key
  PROCESSID: "processId", // Map PROCESSID setting to processId object key
  FUNCTIONNAME: "functionName", // Map FUNCTIONNAME setting to functionName object key
  TYPE: "type", // Map TYPE setting to type object key
  BODY: "body", // Map BODY setting to body object key
  TIME: "time", // Show Currenct Time
};

/**
 * * Contains ANSI escape codes for colors.
 */

export const colorsMap: ColorsMap = {
  // Text styles
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
  bold: "\x1b[1m",
  italic: "\x1b[3m",
  strikethrough: "\x1b[9m",

  // Foreground colors
  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    gray: "\x1b[90m", // Default dark gray
    darkGray: "\x1b[38;5;232m", // Deeper gray
    darkRed: "\x1b[38;5;52m", // Deeper red
    darkGreen: "\x1b[38;5;22m", // Deeper green
    darkYellow: "\x1b[38;5;58m", // Deeper yellow (mustard)
    darkBlue: "\x1b[38;5;17m", // Deeper navy blue
    darkMagenta: "\x1b[38;5;53m", // Deeper magenta
    darkCyan: "\x1b[38;5;23m", // Deeper teal/cyan
    darkWhite: "\x1b[38;5;255m", // Off-white, more dimmed
    brightRed: "\x1b[91m",
    brightGreen: "\x1b[92m",
    brightYellow: "\x1b[93m",
    brightBlue: "\x1b[94m",
    brightMagenta: "\x1b[95m",
    brightCyan: "\x1b[96m",
    brightWhite: "\x1b[97m",

    // Creative Colors
    purple: "\x1b[38;5;128m", // Purple (ANSI color)
    lightPurple: "\x1b[38;5;135m", // Light Purple
    teal: "\x1b[38;5;38m", // Teal
    coral: "\x1b[38;5;209m", // Coral
    gold: "\x1b[38;5;214m", // Gold
    lavender: "\x1b[38;5;177m", // Lavender
    peach: "\x1b[38;5;214m", // Peach
    olive: "\x1b[38;5;58m", // Olive
    darkOlive: "\x1b[38;5;22m", // Dark Olive
  },

  // Background colors
  bg: {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m",
    gray: "\x1b[100m", // Default gray
    darkGray: "\x1b[48;5;232m", // Deeper gray background
    darkRed: "\x1b[48;5;52m", // Deeper red background
    darkGreen: "\x1b[48;5;22m", // Deeper green background
    darkYellow: "\x1b[48;5;58m", // Mustard yellow background
    darkBlue: "\x1b[48;5;17m", // Deep navy blue background
    darkMagenta: "\x1b[48;5;53m", // Deeper magenta background
    darkCyan: "\x1b[48;5;23m", // Deeper teal/cyan background
    darkWhite: "\x1b[48;5;255m", // Off-white background
    brightRed: "\x1b[101m",
    brightGreen: "\x1b[102m",
    brightYellow: "\x1b[103m",
    brightBlue: "\x1b[104m",
    brightMagenta: "\x1b[105m",
    brightCyan: "\x1b[106m",
    brightWhite: "\x1b[107m",

    // Creative Background Colors
    purple: "\x1b[48;5;128m", // Purple background
    lightPurple: "\x1b[48;5;135m", // Light Purple background
    teal: "\x1b[48;5;38m", // Teal background
    coral: "\x1b[48;5;209m", // Coral background
    gold: "\x1b[48;5;214m", // Gold background
    lavender: "\x1b[48;5;177m", // Lavender background
    peach: "\x1b[48;5;214m", // Peach background
    olive: "\x1b[48;5;58m", // Olive background
    darkOlive: "\x1b[48;5;22m", // Dark Olive background
  },
};

/**
 * * Contains default key color map.
 * & Maps each key to its corresponding foreground and background colors.
 */
export const defaultKeyColorMap: KeyColorMap = {
  orderId: {
    fgColor: colorsMap.bold + colorsMap.fg.white,
    bgColor: colorsMap.bg.darkOlive,
    fgComplementary: colorsMap.fg.darkOlive,
    bgComplementary: colorsMap.bg.white,
  },
  sessionId: {
    fgColor: colorsMap.bold + colorsMap.fg.white,
    bgColor: colorsMap.bg.darkRed,
    fgComplementary: colorsMap.fg.darkRed,
    bgComplementary: colorsMap.bg.white,
  },
  processId: {
    fgColor: colorsMap.bold + colorsMap.fg.white,
    bgColor: colorsMap.bg.blue,
    fgComplementary: colorsMap.fg.blue,
    bgComplementary: colorsMap.bg.white,
  },
  functionName: {
    fgColor: colorsMap.bold + colorsMap.fg.brightYellow,
    bgColor: colorsMap.bg.darkOlive,
    fgComplementary: colorsMap.fg.darkOlive,
    bgComplementary: colorsMap.bg.brightYellow,
  },
  type: {
    fgColor: colorsMap.bold + colorsMap.fg.white,
    bgColor: colorsMap.bg.darkCyan,
    fgComplementary: colorsMap.fg.darkCyan,
    bgComplementary: colorsMap.bg.white,
  },
  body: {
    fgColor: "",
    bgColor: "",
    fgComplementary: "",
    bgComplementary: "",
  },
  time: {
    fgColor: colorsMap.bold + colorsMap.fg.white,
    bgColor: colorsMap.bg.darkMagenta,
    fgComplementary: colorsMap.fg.darkMagenta,
    bgComplementary: colorsMap.bg.white,
  },
};
export const months: Month[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Special Characters for Terminal Display
export const specialCharacters: Record<SpecialCharacter, string> = {
  // Arrow Characters
  rightArrow: "\u2192", // Right Arrow
  leftArrow: "\u2190", // Left Arrow
  upArrow: "\u2191", // Up Arrow
  downArrow: "\u2193", // Down Arrow
  leftRightArrow: "\u2194", // Left-Right Arrow
  upDownArrow: "\u2195", // Up-Down Arrow
  upRightArrow: "\u2197", // Up-Right Arrow
  upLeftArrow: "\u2196", // Up-Left Arrow
  downRightArrow: "\u2198", // Down-Right Arrow
  downLeftArrow: "\u2199", // Down-Left Arrow
  rightDoubleArrow: "\u21D2", // Right Double Arrow
  leftRightDoubleArrow: "\u21D4", // Left-Right Double Arrow
  upDoubleArrow: "\u21D1", // Up Double Arrow
  downDoubleArrow: "\u21D3", // Down Double Arrow
  heavyRightArrow: "\u2794", // Heavy Right Arrow

  // Box and Line Drawing Characters
  horizontalLine: "\u2500", // Horizontal Line
  verticalLine: "\u2502", // Vertical Line
  topLeftCorner: "\u250C", // Top Left Corner
  topRightCorner: "\u2510", // Top Right Corner
  bottomLeftCorner: "\u2514", // Bottom Left Corner
  bottomRightCorner: "\u2518", // Bottom Right Corner
  leftTShape: "\u251C", // Left T-Shape
  rightTShape: "\u2524", // Right T-Shape
  tShapeDown: "\u252C", // T-Shape Down
  tShapeUp: "\u2534", // T-Shape Up
  crossShape: "\u253C", // Cross Shape
  doubleHorizontalLine: "\u2550", // Double Horizontal Line
  doubleVerticalLine: "\u2551", // Double Vertical Line
  doubleTopLeftCorner: "\u2554", // Double Top Left Corner
  doubleTopRightCorner: "\u2557", // Double Top Right Corner
  doubleBottomLeftCorner: "\u255A", // Double Bottom Left Corner
  doubleBottomRightCorner: "\u255D", // Double Bottom Right Corner
  doubleLeftTShape: "\u2560", // Double Left T-Shape
  doubleRightTShape: "\u2563", // Double Right T-Shape
  doubleCrossShape: "\u256C", // Double Cross Shape

  // Additional Special Characters
  transitionArrow: "\uE0B0", // Special character
};

export const defaultSeparator = specialCharacters.transitionArrow;
