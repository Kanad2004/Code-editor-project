package com.judge.workerservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SubmissionJob(
    @JsonProperty("submission_id") String submissionId,
    @JsonProperty("problem_id") String problemId,
    @JsonProperty("source_code") String sourceCode,
    @JsonProperty("language") String language,
    @JsonProperty("time_limit") Integer timeLimit,
    @JsonProperty("memory_limit") Integer memoryLimit
) {}
