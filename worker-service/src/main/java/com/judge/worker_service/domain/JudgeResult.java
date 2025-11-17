package com.judge.workerservice.domain;

public record JudgeResult(
    String status,
    String output,
    Long executionTimeMs,
    Long memoryUsedKb
) {}
