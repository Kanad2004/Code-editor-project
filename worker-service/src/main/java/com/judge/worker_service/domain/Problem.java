package com.judge.workerservice.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.Data;

import java.util.List;

@Data
@Document(collection = "problems")
public class Problem {
    @Id
    private String id;
    
    // We must use @Field because the name in Node.js was snake_case
    @Field("hidden_test_cases")
    private List<TestCase> hiddenTestCases;
}