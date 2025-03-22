import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

let sdk: NodeSDK | null;

export async function initTracing(sdkUrl: string): Promise<NodeSDK | null> {
  if (sdk !== null) {
    return sdk;
  }
  try {
    sdk = new NodeSDK({
      traceExporter: new OTLPTraceExporter({
        url: sdkUrl,
      }),
      instrumentations: [getNodeAutoInstrumentations()],
    });

    await sdk.start();
  } catch (err) {
    console.error('Encountered Exception:', String(err));
  }

  return sdk;
}
