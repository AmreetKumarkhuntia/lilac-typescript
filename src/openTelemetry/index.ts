/**
 * OpenTelemetry tracing module handles distributed tracing setup and management.
 * @module OpenTelemetry
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { OpenTelemetryConfig } from '../types';

/**
 * Global OpenTelemetry SDK instance.
 * @type {NodeSDK|null}
 */
export let otelSdk: NodeSDK | null = null;

/**
 * Initializes OpenTelemetry tracing with the given configuration.
 * @param {OpenTelemetryConfig} config - Tracing configuration
 * @returns {NodeSDK|null} The initialized SDK instance or null on failure
 *
 * @example <caption>Basic initialization</caption>
 * initTracing({
 *   url: 'http://otel-collector:4317',
 *   scheduledDelayMillis: 5000,
 *   maxExportBatchSize: 100,
 *   maxQueueSize: 1000
 * });
 *
 * @note Automatically registers shutdown handlers for SIGTERM/SIGINT.
 * Uses batch processing for efficient span exporting.
 */
export function initTracing(config: OpenTelemetryConfig): NodeSDK | null {
  try {
    if (!otelSdk) {
      const exporter = new OTLPTraceExporter({ url: config.url });
      const processor = new BatchSpanProcessor(exporter, {
        scheduledDelayMillis: config.scheduledDelayMillis,
        maxExportBatchSize: config.maxExportBatchSize,
        maxQueueSize: config.maxQueueSize,
      });

      otelSdk = new NodeSDK({
        spanProcessor: processor,
        instrumentations: [getNodeAutoInstrumentations()],
        serviceName: config.serviceName,
      });
      // Add shutdown handlers
      process.on('SIGTERM', async () => {
        await shutdownOpenTelemetryTracing();
        process.exit(0);
      });

      process.on('SIGINT', async () => {
        await shutdownOpenTelemetryTracing();
        process.exit(0);
      });

      otelSdk.start();
    }
  } catch (err) {
    console.error('Failed to initialize tracing:', String(err));
    return null;
  }
  return otelSdk;
}

/**
 * Forces immediate export of all pending spans to the OpenTelemetry collector.
 * @returns {Promise<void>} Resolves when spans are flushed or rejects on error
 *
 * @example <caption>Flushing before shutdown</caption>
 * await flushSpans();
 *
 * @note Typically used:
 * - Before application shutdown
 * - When needing to ensure spans are exported immediately
 * - For debugging/testing purposes
 */
export async function flushSpans(): Promise<void> {
  if (otelSdk === null) return;
  try {
    const provider = otelSdk['_tracerProvider'];
    if (!provider) return;

    // Handle both BatchSpanProcessor and SimpleSpanProcessor
    const processor = provider.activeSpanProcessor;
    if (processor) {
      await processor.forceFlush();
    }
  } catch (err) {
    console.error('Failed to flush spans:', err);
  }
}

/**
 * Gracefully shuts down OpenTelemetry tracing, ensuring all spans are exported.
 * @returns {Promise<void>} Resolves when shutdown is complete or rejects on error
 *
 * @example <caption>Shutting down tracing</caption>
 * await shutdownOpenTelemetryTracing();
 *
 * @note Automatically called on SIGTERM/SIGINT when initialized via initTracing().
 * Should be called:
 * - Before application exit
 * - When tracing is no longer needed
 * - After flushSpans() if needing to ensure span export
 */
export async function shutdownOpenTelemetryTracing(): Promise<void> {
  if (otelSdk === null) return;
  try {
    await flushSpans();
    await otelSdk.shutdown();
    otelSdk = null;
  } catch (err) {
    console.error('Encountered Exception:', String(err));
  }
}
