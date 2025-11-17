FROM node:18-slim

# Install timeout utility
RUN apt-get update && apt-get install -y coreutils && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Copy run script
COPY run.sh /workspace/run.sh
RUN chmod +x /workspace/run.sh

# Use existing node user (UID 1000) or create with different UID
RUN id -u 1001 &>/dev/null || useradd -m -u 1001 judge

# Switch to non-root user
USER node

CMD ["/bin/bash"]
