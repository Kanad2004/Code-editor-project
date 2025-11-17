package com.judge.workerservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class LanguageExecutionStrategy {
    
    @Value("${docker.image.cpp}")
    private String cppImage;
    
    @Value("${docker.image.java}")
    private String javaImage;
    
    @Value("${docker.image.python}")
    private String pythonImage;
    
    @Value("${docker.image.javascript}")
    private String jsImage;
    
    private final Map<String, LanguageConfig> languageConfigs = new HashMap<>();
    
    public String getDockerImage(String language) {
        return switch (language.toLowerCase()) {
            case "cpp", "c++" -> cppImage;
            case "java" -> javaImage;
            case "python", "py" -> pythonImage;
            case "javascript", "js" -> jsImage;
            default -> cppImage; // Default fallback
        };
    }
    
    public String getSourceFileName(String language) {
        return switch (language.toLowerCase()) {
            case "cpp", "c++" -> "main.cpp";
            case "java" -> "Main.java";
            case "python", "py" -> "main.py";
            case "javascript", "js" -> "main.js";
            default -> "main.cpp";
        };
    }
    
    public record LanguageConfig(
        String dockerImage,
        String sourceFileName,
        int defaultTimeLimit,
        int defaultMemoryLimit
    ) {}
}
