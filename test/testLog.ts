import { Partitioners } from 'kafkajs';
import ProcessLogger from '../src/index.ts';
import { LoggerSettings } from '../src/types/coreTypes.ts';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const testConfigs: Array<Partial<LoggerSettings>> = [
  // //Default test case
  // {},
  // //Masking test case
  // {
  //   maskingKeys: new Set<string>(['sensitiveKey']),
  // },
  // // Formatting test case
  // {
  //   skipFormatting: true,
  // },
  // {
  //   enableKafkaLogPublishing: true,
  //   kafkaConfig: {
  //     brokerList: ['localhost:9092'],
  //     clientId: 'test-kafka-client',
  //     kafkaTopics: ['kafka-test-topic'],
  //     disconnectAfterSendingMessage: false,
  //     producerConfig: {
  //       createPartitioner: Partitioners.LegacyPartitioner,
  //     },
  //   },
  // },
  {
    enableOpenTelemetryPublishing: true,
    openTelemetryConfig: {
      url: 'http://localhost:4318/v1/traces',
      scheduledDelayMillis: 100,
      maxExportBatchSize: 100,
      maxQueueSize: 1000,
      serviceName: 'test-logger',
    },
  },
];

function testLogFunctionCalled(currLogger: ProcessLogger): void {
  const functionName: string = 'testFunction';
  const body = { key: 'value' };
  currLogger.logFunctionCalled(functionName, body);
}

function testLogFunctionCallResult(currLogger: ProcessLogger): void {
  const functionName: string = 'testFunction';
  const result = { resultKey: 'resultValue' };
  currLogger.logFunctionCallResult(functionName, result);
}

function testLogFunctionInfo(currLogger: ProcessLogger): void {
  const functionName: string = 'testFunction';
  const info = { infoKey: 'infoValue' };
  currLogger.logFunctionInfo(functionName, info);
}

function testLogExternalApiRequest(currLogger: ProcessLogger): void {
  const apiName: string = 'testApi';
  const request = { param: 'value' };
  currLogger.logExternalApiRequest(apiName, request);
}

function testLogExternalApiResponse(currLogger: ProcessLogger): void {
  const apiName: string = 'testApi';
  const response = { responseKey: 'responseValue' };
  currLogger.logExternalApiResponse(apiName, response);
}

function testLogException(currLogger: ProcessLogger): void {
  const functionName: string = 'testFunction';
  const error = 'Test error';
  currLogger.logException(functionName, error);
}

function testLogServerRequest(currLogger: ProcessLogger): void {
  const endpoint: string = 'testEndpoint';
  const request = { requestKey: 'requestValue' };
  currLogger.logServerRequest(endpoint, request);
}

function testLogServerResponse(currLogger: ProcessLogger): void {
  const endpoint: string = 'testEndpoint';
  const response = { responseKey: 'responseValue' };
  currLogger.logServerResponse(endpoint, response);
}

function testLogDbQueryRequest(currLogger: ProcessLogger): void {
  const query: string = 'SELECT * FROM test';
  const parameters = { param1: 'value1' };
  currLogger.logDbQueryRequest(query, parameters);
}

function testLogDbQueryResponse(currLogger: ProcessLogger): void {
  const query: string = 'SELECT * FROM test';
  const response = { rows: [] };
  currLogger.logDbQueryResponse(query, response);
}

function testLogRedisQueryRequest(currLogger: ProcessLogger): void {
  const query: string = 'GET testKey';
  const parameters = { param: 'value' };
  currLogger.logRedisQueryRequest(query, parameters);
}

function testLogRedisQueryResult(currLogger: ProcessLogger): void {
  const query: string = 'GET testKey';
  const result = { resultKey: 'resultValue' };
  currLogger.logRedisQueryResult(query, result);
}

function testLogDebug(currLogger: ProcessLogger): void {
  const message: string = 'Test debug message';
  const data = { key: 'value' };
  currLogger.logDebug(message, data);
}

function testLogWithMaskingInDebug(currLogger: ProcessLogger): void {
  const message: string = 'Debugging sensitive information';
  const data = {
    sensitiveKey: 'sensitiveValue',
    anotherKey: 'anotherValue',
  };
  currLogger.logDebug(message, data);
}

function testLogWithMasking(currLogger: ProcessLogger): void {
  const message: string = 'Debugging sensitive information';
  const data = {
    sensitiveKey: 'sensitiveValue',
    anotherKey: 'anotherValue',
  };
  currLogger.logFunctionCalled(message, data);
}

// Run all tests
async function runTests() {
  for (let i = 0; i < testConfigs.length; i++) {
    const currConfig = testConfigs[i];
    const currLogger = new ProcessLogger(currConfig);

    console.log(`>>>>>>>>>>> RUNNING TEST CASE: ${i} <<<<<<<<<<<`);

    testLogFunctionCalled(currLogger);
    testLogFunctionCallResult(currLogger);
    testLogFunctionInfo(currLogger);
    testLogExternalApiRequest(currLogger);
    testLogExternalApiResponse(currLogger);
    testLogException(currLogger);
    testLogServerRequest(currLogger);
    testLogServerResponse(currLogger);
    testLogDbQueryRequest(currLogger);
    testLogDbQueryResponse(currLogger);
    testLogRedisQueryRequest(currLogger);
    testLogRedisQueryResult(currLogger);
    testLogDebug(currLogger);
    testLogWithMaskingInDebug(currLogger);
    testLogWithMasking(currLogger);
  }

  const rl = readline.createInterface({ input, output });
  await rl.question('Press Enter to exit...');
  rl.close();
}

runTests();
