package com.judge.workerservice.service;

import com.judge.workerservice.dto.SubmissionJob;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQConsumer {

    private static final Logger LOGGER = LoggerFactory.getLogger(RabbitMQConsumer.class);
    private final JudgeService judgeService;

    @Autowired
    public RabbitMQConsumer(JudgeService judgeService) {
        this.judgeService = judgeService;
    }

    @RabbitListener(queues = {"${rabbitmq.queue.submission}"})
    public void consumeSubmission(SubmissionJob job) {
        // Add submission ID to logging context
        MDC.put("submissionId", job.submissionId());
        MDC.put("problemId", job.problemId());
        
        LOGGER.info("Received submission job for language: {}", job.language());
        
        try {
            judgeService.processSubmission(job);
            LOGGER.info("Successfully processed submission");
        } catch (Exception e) {
            LOGGER.error("Failed to process submission: {}", e.getMessage(), e);
            judgeService.updateSubmissionStatusToError(job.submissionId(), "Internal Judge Error: " + e.getMessage());
        } finally {
            MDC.clear();
        }
    }
    
    @RabbitListener(queues = {"${rabbitmq.queue.test}"})
    public void consumeTestSubmission(SubmissionJob job) {
        MDC.put("submissionId", job.submissionId());
        LOGGER.info("Received test submission job");
        
        try {
            // Test runs only execute sample test cases
            judgeService.processTestSubmission(job);
            LOGGER.info("Successfully processed test submission");
        } catch (Exception e) {
            LOGGER.error("Failed to process test submission: {}", e.getMessage(), e);
        } finally {
            MDC.clear();
        }
    }
}
