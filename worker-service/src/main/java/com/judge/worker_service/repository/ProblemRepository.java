package com.judge.workerservice.repository;

import com.judge.workerservice.domain.Problem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.Optional;

public interface ProblemRepository extends MongoRepository<Problem, String> {
    
    // We only need the test cases, so we project *only* that field
    @Query(value = "{ '_id' : ?0 }", fields = "{ 'hiddenTestCases' : 1 }")
    Optional<Problem> findTestCasesById(String id);
}