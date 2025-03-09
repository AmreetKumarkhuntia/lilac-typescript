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
