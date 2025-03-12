#!/bin/bash

# Start Kafka in the background
/etc/confluent/docker/run &

# Wait for Kafka to be ready
echo "Waiting for Kafka to be ready..."
while ! nc -z localhost 9092; do
  sleep 1
done

echo "Kafka is ready!"

# Create Kafka topic(s) from args
if [ ! -z "$KAFKA_TOPIC" ]; then
  echo "Creating topic $KAFKA_TOPIC with $KAFKA_PARTITIONS partitions and $KAFKA_REPLICATION_FACTOR replication factor..."
  kafka-topics --create --if-not-exists --bootstrap-server localhost:9092 \
    --topic "$KAFKA_TOPIC" --partitions "$KAFKA_PARTITIONS" --replication-factor "$KAFKA_REPLICATION_FACTOR"
  echo "Topic $KAFKA_TOPIC created!"
else
  echo "No topic specified."
fi

# Keep container running
tail -f /dev/null
