# Use the official OpenTelemetry Collector base image
FROM otel/opentelemetry-collector-contrib:latest

# Copy the config file into the container
COPY openTelemetryConfig.yaml /etc/otel-config.yaml

# Start the collector using the config
CMD ["--config", "/etc/otel-config.yaml"]
