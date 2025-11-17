package com.judge.workerservice.util;

public class Constants {
    
    // Statuses
    public static final String STATUS_PENDING = "Pending";
    public static final String STATUS_JUDGING = "Judging";
    public static final String STATUS_ACCEPTED = "Accepted";
    public static final String STATUS_WRONG_ANSWER = "Wrong Answer";
    public static final String STATUS_TIME_LIMIT = "Time Limit Exceeded";
    public static final String STATUS_MEMORY_LIMIT = "Memory Limit Exceeded";
    public static final String STATUS_RUNTIME_ERROR = "Runtime Error";
    public static final String STATUS_COMPILATION_ERROR = "Compilation Error";
    public static final String STATUS_INTERNAL_ERROR = "Internal Error";
    
    // Docker result codes
    public static final String DOCKER_SUCCESS = "SUCCESS";
    public static final String DOCKER_COMPILATION_ERROR = "COMPILATION_ERROR";
    public static final String DOCKER_RUNTIME_ERROR = "RUNTIME_ERROR";
    public static final String DOCKER_TIME_LIMIT = "TIME_LIMIT_EXCEEDED";
    public static final String DOCKER_INTERNAL_ERROR = "INTERNAL_ERROR";
    
    private Constants() {}
}
