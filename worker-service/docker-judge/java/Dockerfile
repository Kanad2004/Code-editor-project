FROM eclipse-temurin:17-jre

# Install timeout utility and other essentials
RUN apt-get update && apt-get install -y coreutils && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Copy run script
COPY run.sh /workspace/run.sh
RUN chmod +x /workspace/run.sh

# Create non-root user
RUN useradd -m -u 1001 judge
USER judge

CMD ["/bin/bash"]
