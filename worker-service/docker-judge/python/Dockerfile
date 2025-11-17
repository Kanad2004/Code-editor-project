FROM python:3.11-slim

# Install timeout utility
RUN apt-get update && apt-get install -y coreutils && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Copy run script
COPY run.sh /workspace/run.sh
RUN chmod +x /workspace/run.sh

# Create non-root user
RUN useradd -m -u 1000 judge
USER judge

CMD ["/bin/bash"]
