package com.judge.workerservice.service;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.command.WaitContainerResultCallback;
import com.github.dockerjava.api.model.Bind;
import com.github.dockerjava.api.model.Frame;
import com.github.dockerjava.api.model.HostConfig;
import com.github.dockerjava.api.model.Volume;
import com.github.dockerjava.core.async.LogContainerResultCallback;
import com.judge.workerservice.domain.JudgeResult;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class DockerSandboxService {

    private static final Logger LOGGER = LoggerFactory.getLogger(DockerSandboxService.class);
    private final DockerClient dockerClient;
    private static final String IMAGE_NAME = "my-cpp-judge-image"; // The image we built

    @Autowired
    public DockerSandboxService(DockerClient dockerClient) {
        this.dockerClient = dockerClient;
    }

    public JudgeResult run(String sourceCode, String input, int timeLimit, int memoryLimit) throws IOException, InterruptedException {
        // 1. Create a unique temporary directory for this run
        Path tempDir = Files.createTempDirectory("judge-run-" + UUID.randomUUID());

        try {
            // 2. Write source code and input to files
            Files.writeString(tempDir.resolve("main.cpp"), sourceCode);
            Files.writeString(tempDir.resolve("input.txt"), input);

            // 3. Configure Docker container
            HostConfig hostConfig = new HostConfig()
                    .withMemory((long) memoryLimit * 1024 * 1024) // Memory limit in bytes
                    .withMemorySwap(0L) // Disable swap
                    .withCpuCount(1L) // Limit to 1 CPU
                    .withNetworkMode("none") // Disable network
                    .withBinds(new Bind(tempDir.toAbsolutePath().toString(), new Volume("/app")));

            // 4. Create the container
            CreateContainerResponse container = dockerClient.createContainerCmd(IMAGE_NAME)
                    .withHostConfig(hostConfig)
                    .withWorkingDir("/app")
                    .withCmd("/app/run.sh", String.valueOf(timeLimit)) // Pass time limit to script
                    .exec();

            String containerId = container.getId();
            
            // 5. Start the container
            dockerClient.startContainerCmd(containerId).exec();

            // 6. Wait for the container to finish
            WaitContainerResultCallback waitCallback = new WaitContainerResultCallback();
            dockerClient.waitContainerCmd(containerId).exec(waitCallback).awaitCompletion();

            // 7. Get logs (stdout/stderr)
            final StringBuilder logOutput = new StringBuilder();
            LogContainerResultCallback logCallback = new LogContainerResultCallback() {
                @Override
                public void onNext(Frame item) {
                    logOutput.append(new String(item.getPayload(), StandardCharsets.UTF_8));
                }
            };

            dockerClient.logContainerCmd(containerId)
                    .withStdOut(true)
                    .withStdErr(true)
                    .exec(logCallback)
                    .awaitCompletion(5, TimeUnit.SECONDS); // Wait max 5s for logs

            // 8. Parse the output (as defined by run.sh)
            String fullOutput = logOutput.toString().trim();
            String[] lines = fullOutput.split("\n");
            String status = lines[0].trim();
            String outputData = Arrays.stream(lines).skip(1).collect(Collectors.joining("\n")).trim();

            return new JudgeResult(status, outputData);

        } catch (Exception e) {
            LOGGER.error("Error running sandbox", e);
            return new JudgeResult("INTERNAL_ERROR", e.getMessage());
        } finally {
            // 9. Clean up: Remove temp directory
            if (tempDir != null) {
                FileUtils.deleteDirectory(tempDir.toFile());
            }
            // Note: We leave the container for inspection. In prod, you'd
            // dockerClient.removeContainerCmd(containerId).exec();
        }
    }
}