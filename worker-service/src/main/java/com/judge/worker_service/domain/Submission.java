package com.judge.workerservice.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "submissions")
public class Submission {
    @Id
    private String id;
    
    private String status;
    private String verdict;
    
    @Field("execution_time")
    private Long executionTime;
    
    @Field("memory_used")
    private Long memoryUsed;
    
    @Field("test_cases_passed")
    private Integer testCasesPassed;
    
    @Field("total_test_cases")
    private Integer totalTestCases;
    
    @Field("judged_at")
    private LocalDateTime judgedAt;
    
    @Field("test_results")
    private List<TestCaseResult> testResults;
}
