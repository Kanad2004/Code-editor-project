package com.judge.workerservice.repository;

import com.judge.workerservice.domain.Submission;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SubmissionRepository extends MongoRepository<Submission, String> {
    // We just need the built-in findById() and save()
}