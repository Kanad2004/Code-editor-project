package com.judge.workerservice.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "problems")
public class Problem {
    @Id
    private String id;
    
    private String title;
    
    @Field("hidden_test_cases")
    private List<TestCase> hiddenTestCases;
    
    @Field("time_limit")
    private Integer timeLimit = 5;
    
    @Field("memory_limit")
    private Integer memoryLimit = 256;
}
