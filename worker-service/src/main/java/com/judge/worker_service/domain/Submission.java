package com.judge.workerservice.domain;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@Document(collection = "submissions")
public class Submission {
    @Id
    private String id;
    private String status;
    private String verdict;
    
    @Field("run_time")
    private Long runTime;
    
    @Field("memory_used")
    private Long memoryUsed;
    
    // other fields like source_code, language, etc., exist
    // but we only need to map the ones we intend to *write* to.
}