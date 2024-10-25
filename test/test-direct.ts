// Import ProcessLogger from index.js file located in ../src/js directory
import ProcessLogger from '../src/index.js';
import type { ProcessLog } from '../src/types.js';

// Create a new instance of ProcessLogger
const logger = new ProcessLogger({
  displayOrder: [
    'TIME', // Display time
    'PROCESSID', // Display process ID
    'FUNCTIONNAME', // Display function name
    'TYPE', // Display type
    'BODY', // Display body
  ],
});

// Function to generate a UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0; // Generate a random number between 0 and 15
    const v = c === 'x' ? r : (r & 0x3) | 0x8; // If 'y', ensure the format
    return v.toString(16); // Convert to hexadecimal
  });
}

// Function to generate a random log object
function generateRandomLog(): ProcessLog {
  // Generating a random orderId
  const orderId = Math.floor(Math.random() * 1000);
  // Generating a random sessionId
  const sessionId = generateUUID();
  // Generating a random processId
  const processId = generateUUID();
  // Fixed value for functionName
  const functionName = 'testingString';
  // Fixed value for type
  const type = 'functionCalled';
  // Fixed value for body, represented as a JSON string
  const body = JSON.stringify({
    orderId: '1',
    sessionId: 'abcdef123456',
    processId: 'obj',
    functionName: 'function',
    type: 'types',
    body: 'bodies',
  });

  // Return the generated log object
  return {
    orderId,
    sessionId,
    processId,
    functionName,
    type,
    body,
  };
}

// Generate a random log object
const randomLog = generateRandomLog();

// Log the generated log using the logger instance
logger.directLog(randomLog);
