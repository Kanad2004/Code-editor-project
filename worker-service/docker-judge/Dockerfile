# Use a minimal, recent Ubuntu
FROM ubuntu:22.04

# Set non-interactive for package installs
ENV DEBIAN_FRONTEND=noninteractive

# Install only the bare essentials: compiler, build tools, and timeout
RUN apt-get update && apt-get install -y \
    g++ \
    build-essential \
    coreutils \
    && rm -rf /var/lib/apt/lists/*

# Create the app directory
WORKDIR /app

# Copy the execution script into the container
COPY run.sh /app/run.sh

# Set executable permissions for the script
RUN chmod +x /app/run.sh