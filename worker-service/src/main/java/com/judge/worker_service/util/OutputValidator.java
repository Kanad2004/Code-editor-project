package com.judge.workerservice.util;

import org.springframework.stereotype.Component;

@Component
public class OutputValidator {
    
    /**
     * Validates if actual output matches expected output
     * Handles whitespace normalization
     */
    public boolean validate(String expected, String actual) {
        if (expected == null || actual == null) {
            return false;
        }
        
        // Normalize: trim each line and remove trailing empty lines
        String normalizedExpected = normalizeOutput(expected);
        String normalizedActual = normalizeOutput(actual);
        
        return normalizedExpected.equals(normalizedActual);
    }
    
    private String normalizeOutput(String output) {
        if (output == null) return "";
        
        // Split by lines, trim each line, rejoin
        String[] lines = output.split("\\r?\\n");
        StringBuilder normalized = new StringBuilder();
        
        for (String line : lines) {
            String trimmed = line.trim();
            if (!trimmed.isEmpty()) {
                if (normalized.length() > 0) {
                    normalized.append("\n");
                }
                normalized.append(trimmed);
            }
        }
        
        return normalized.toString();
    }
    
    /**
     * Validates floating point numbers with tolerance
     */
    public boolean validateFloatingPoint(String expected, String actual, double epsilon) {
        try {
            double expectedVal = Double.parseDouble(expected.trim());
            double actualVal = Double.parseDouble(actual.trim());
            return Math.abs(expectedVal - actualVal) < epsilon;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}
