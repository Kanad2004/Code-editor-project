package com.judge.workerservice.dto;

// This record MUST match the JSON payload from the Node.js publisher
public record SubmissionJob(
        String submissionId,
        String problemId,
        String sourceCode,
        String language,
        int timeLimit,    // in seconds
        int memoryLimit   // in MB
) {
}