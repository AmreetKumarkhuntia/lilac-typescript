# Use Confluent Kafka base image
FROM confluentinc/cp-kafka:latest

# Switch to root to install dependencies
USER root

# Install dependencies using microdnf
RUN microdnf update && \
    microdnf install -y wget iproute && \
    microdnf clean all

# Copy entry script to container
COPY create-topics.sh /usr/local/bin/create-topics.sh

# 🔥 Set permissions as root
RUN chmod +x /usr/local/bin/create-topics.sh

# Switch back to the non-root user (confluent)
USER 1001

# Start Kafka + create topics
CMD ["/usr/local/bin/create-topics.sh"]
