package com.judge.workerservice.service;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.command.WaitContainerResultCallback;
import com.github.dockerjava.api.model.*;
import com.github.dockerjava.core.command.LogContainerResultCallback;
import com.judge.workerservice.domain.JudgeResult;
import com.judge.workerservice.util.Constants;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

@Service
public class DockerSandboxService {

    private static final Logger LOGGER = LoggerFactory.getLogger(DockerSandboxService.class);
    
    private final DockerClient dockerClient;
    private final LanguageExecutionStrategy languageStrategy;
    
    @Value("${execution.output.max.size:10240}")
    private int maxOutputSize;

    @Autowired
    public DockerSandboxService(DockerClient dockerClient, LanguageExecutionStrategy languageStrategy) {
        this.dockerClient = dockerClient;
        this.languageStrategy = languageStrategy;
    }

    public JudgeResult run(String sourceCode, String language, String input, int timeLimit, int memoryLimit) {
        Path tempDir = null;
        String containerId = null;
        
        try {
            // 1. Create temporary directory
            tempDir = Files.createTempDirectory("judge-");
            LOGGER.debug("Created temp directory: {}", tempDir);

            // 2. Write source code and input files
            String sourceFileName = languageStrategy.getSourceFileName(language);
            Files.writeString(tempDir.resolve(sourceFileName), sourceCode);
            Files.writeString(tempDir.resolve("input.txt"), input);

            // 3. Get appropriate Docker image for language
            String dockerImage = languageStrategy.getDockerImage(language);
            LOGGER.debug("Using Docker image: {} for language: {}", dockerImage, language);

            // 4. Configure container with resource limits and security
            HostConfig hostConfig = new HostConfig()
                    .withMemory((long) memoryLimit * 1024 * 1024) // MB to bytes
                    .withMemorySwap((long) memoryLimit * 1024 * 1024) // Disable swap
                    .withCpuQuota(100000L) // Limit to 1 CPU core
                    .withCpuPeriod(100000L)
                    .withNetworkMode("none") // Disable network access
                    .withPidsLimit(100L) // Prevent fork bombs
                    .withReadonlyRootfs(false) // Need write for compilation
                    .withBinds(new Bind(
                        tempDir.toAbsolutePath().toString(), 
                        new Volume("/workspace"),
                        AccessMode.rw
                    ));

            // 5. Create container
            CreateContainerResponse container = dockerClient.createContainerCmd(dockerImage)
                    .withHostConfig(hostConfig)
                    .withWorkingDir("/workspace")
                    .withCmd("/bin/bash", "/workspace/run.sh", String.valueOf(timeLimit))
                    .withAttachStdout(true)
                    .withAttachStderr(true)
                    .exec();

            containerId = container.getId();
            LOGGER.debug("Created container: {}", containerId);

            // 6. Start container
            long startTime = System.currentTimeMillis();
            dockerClient.startContainerCmd(containerId).exec();

            // 7. Wait for container with timeout
            Integer statusCode;
            try {
                statusCode = dockerClient.waitContainerCmd(containerId)
                        .exec(new WaitContainerResultCallback())
                        .awaitStatusCode(timeLimit + 5, TimeUnit.SECONDS);
            } catch (Exception e) {
                LOGGER.warn("Container wait timed out or failed: {}", e.getMessage());
                // Kill the container if still running
                try {
                    dockerClient.killContainerCmd(containerId).exec();
                } catch (Exception killEx) {
                    LOGGER.error("Failed to kill container: {}", killEx.getMessage());
                }
                return new JudgeResult(
                    Constants.DOCKER_TIME_LIMIT,
                    "Execution timed out",
                    (long) timeLimit * 1000,
                    null
                );
            }

            long executionTime = System.currentTimeMillis() - startTime;

            // 8. Memory stats (not available in all Docker setups, so we skip it)
            Long memoryUsed = null; // TODO: Implement when Docker stats API is stable

            // 9. Collect logs (stdout + stderr)
            final StringBuilder outputBuilder = new StringBuilder();
            final StringBuilder errorBuilder = new StringBuilder();
            
            try {
                LogContainerResultCallback loggingCallback = new LogContainerResultCallback() {
                    @Override
                    public void onNext(Frame frame) {
                        String text = new String(frame.getPayload(), StandardCharsets.UTF_8);
                        if (frame.getStreamType() == StreamType.STDOUT) {
                            if (outputBuilder.length() < maxOutputSize) {
                                outputBuilder.append(text);
                            }
                        } else if (frame.getStreamType() == StreamType.STDERR) {
                            if (errorBuilder.length() < maxOutputSize) {
                                errorBuilder.append(text);
                            }
                        }
                    }
                };

                dockerClient.logContainerCmd(containerId)
                        .withStdOut(true)
                        .withStdErr(true)
                        .exec(loggingCallback)
                        .awaitCompletion(5, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                LOGGER.warn("Log collection interrupted: {}", e.getMessage());
                Thread.currentThread().interrupt();
            } catch (Exception e) {
                LOGGER.warn("Failed to collect logs: {}", e.getMessage());
            }

            // 10. Parse output from run.sh
            String fullOutput = outputBuilder.toString().trim();
            String errorOutput = errorBuilder.toString().trim();
            
            // run.sh outputs format: STATUS\nOUTPUT_DATA
            String[] lines = fullOutput.split("\n", 2);
            String status = lines.length > 0 ? lines[0].trim() : Constants.DOCKER_INTERNAL_ERROR;
            String outputData = lines.length > 1 ? lines[1].trim() : "";

            // If there's error output and execution failed, include it
            if (!status.equals(Constants.DOCKER_SUCCESS) && !errorOutput.isEmpty()) {
                outputData = errorOutput;
            }

            // Truncate output if too large
            if (outputData.length() > maxOutputSize) {
                outputData = outputData.substring(0, maxOutputSize) + "\n... (output truncated)";
            }

            LOGGER.debug("Execution completed. Status: {}, Time: {}ms, Exit code: {}", 
                        status, executionTime, statusCode);

            return new JudgeResult(status, outputData, executionTime, memoryUsed);

        } catch (IOException e) {
            LOGGER.error("IO Error during sandbox execution: {}", e.getMessage(), e);
            return new JudgeResult(
                Constants.DOCKER_INTERNAL_ERROR,
                "Failed to create execution environment: " + e.getMessage(),
                null,
                null
            );
        } catch (Exception e) {
            LOGGER.error("Unexpected error during sandbox execution: {}", e.getMessage(), e);
            return new JudgeResult(
                Constants.DOCKER_INTERNAL_ERROR,
                "Internal error: " + e.getMessage(),
                null,
                null
            );
        } finally {
            // 11. Cleanup: Remove container and temp directory
            cleanup(containerId, tempDir);
        }
    }

    /**
     * Clean up Docker container and temporary directory
     */
    private void cleanup(String containerId, Path tempDir) {
        // Remove container
        if (containerId != null) {
            try {
                dockerClient.removeContainerCmd(containerId)
                        .withForce(true)
                        .withRemoveVolumes(true)
                        .exec();
                LOGGER.debug("Removed container: {}", containerId);
            } catch (Exception e) {
                LOGGER.warn("Failed to remove container {}: {}", containerId, e.getMessage());
            }
        }

        // Remove temp directory
        if (tempDir != null) {
            try {
                FileUtils.deleteDirectory(tempDir.toFile());
                LOGGER.debug("Deleted temp directory: {}", tempDir);
            } catch (IOException e) {
                LOGGER.warn("Failed to delete temp directory {}: {}", tempDir, e.getMessage());
            }
        }
    }
}
