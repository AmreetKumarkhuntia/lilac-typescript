// Import ProcessLogger from index.js file located in ../src/js directory
import ProcessLogger from "../src/index.ts";

// Create a new instance of ProcessLogger
const logger = new ProcessLogger();

// Function to generate a random log object
function testRandomLog(): void {
  const functionName: string = "testingString";
  const functionType: string = "functionCalled";

  // Fixed value for body, represented as an object
  const body: { [key: string]: string } = {
    orderId: "1",
    sessionId: "abcdef123456",
    processId: "obj",
    functionName: "function",
    type: "types",
    body: "bodies",
  };

  // Log the values multiple times
  for (let i = 0; i < 5; i++) {
    logger.logWithSetValues(functionName, functionType, body);
  }
}

testRandomLog();
