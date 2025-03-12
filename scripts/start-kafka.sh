#!/bin/bash

echo "Starting Kafka Container..."

# Check if docker-compose.yml exists
if [ -f ./scripts/docker/docker-compose.yml ]; then
  cd ./scripts/docker
  docker-compose up --build
else
  echo "docker-compose.yml not found in ./scripts/docker. Exiting."
  exit 1 # Exit with an error code
fi

echo "Kafka containers started."