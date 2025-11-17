package com.judge.workerservice.domain;

public record TestCaseResult(
    int testCaseNumber,
    String status,
    String input,
    String expectedOutput,
    String actualOutput,
    Long executionTimeMs
) {}
