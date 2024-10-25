import ProcessLogger from '../src/index.ts';

const logger = new ProcessLogger({
  maskingKeys: new Set<string>(['sensitiveKey']),
});

function testLogFunctionCalled(): void {
  const functionName: string = 'testFunction';
  const body = { key: 'value' };
  logger.logFunctionCalled(functionName, body);
}

function testLogFunctionCallResult(): void {
  const functionName: string = 'testFunction';
  const result = { resultKey: 'resultValue' };
  logger.logFunctionCallResult(functionName, result);
}

function testLogFunctionInfo(): void {
  const functionName: string = 'testFunction';
  const info = { infoKey: 'infoValue' };
  logger.logFunctionInfo(functionName, info);
}

function testLogExternalApiRequest(): void {
  const apiName: string = 'testApi';
  const request = { param: 'value' };
  logger.logExternalApiRequest(apiName, request);
}

function testLogExternalApiResponse(): void {
  const apiName: string = 'testApi';
  const response = { responseKey: 'responseValue' };
  logger.logExternalApiResponse(apiName, response);
}

function testLogException(): void {
  const functionName: string = 'testFunction';
  const error = 'Test error';
  logger.logException(functionName, error);
}

function testLogServerRequest(): void {
  const endpoint: string = 'testEndpoint';
  const request = { requestKey: 'requestValue' };
  logger.logServerRequest(endpoint, request);
}

function testLogServerResponse(): void {
  const endpoint: string = 'testEndpoint';
  const response = { responseKey: 'responseValue' };
  logger.logServerResponse(endpoint, response);
}

function testLogDbQueryRequest(): void {
  const query: string = 'SELECT * FROM test';
  const parameters = { param1: 'value1' };
  logger.logDbQueryRequest(query, parameters);
}

function testLogDbQueryResponse(): void {
  const query: string = 'SELECT * FROM test';
  const response = { rows: [] };
  logger.logDbQueryResponse(query, response);
}

function testLogRedisQueryRequest(): void {
  const query: string = 'GET testKey';
  const parameters = { param: 'value' };
  logger.logRedisQueryRequest(query, parameters);
}

function testLogRedisQueryResult(): void {
  const query: string = 'GET testKey';
  const result = { resultKey: 'resultValue' };
  logger.logRedisQueryResult(query, result);
}

function testLogDebug(): void {
  const message: string = 'Test debug message';
  const data = { key: 'value' };
  logger.logDebug(message, data);
}

function testLogWithMaskingInDebug(): void {
  const message: string = 'Debugging sensitive information';
  const data = {
    sensitiveKey: 'sensitiveValue',
    anotherKey: 'anotherValue',
  };
  logger.logDebug(message, data);
}

function testLogWithMasking(): void {
  const message: string = 'Debugging sensitive information';
  const data = {
    sensitiveKey: 'sensitiveValue',
    anotherKey: 'anotherValue',
  };
  logger.logFunctionCalled(message, data);
}

// Run all tests
testLogFunctionCalled();
testLogFunctionCallResult();
testLogFunctionInfo();
testLogExternalApiRequest();
testLogExternalApiResponse();
testLogException();
testLogServerRequest();
testLogServerResponse();
testLogDbQueryRequest();
testLogDbQueryResponse();
testLogRedisQueryRequest();
testLogRedisQueryResult();
testLogDebug();
testLogWithMaskingInDebug();
testLogWithMasking();
