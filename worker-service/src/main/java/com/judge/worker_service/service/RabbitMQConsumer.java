package com.judge.workerservice.service;

import com.judge.workerservice.dto.SubmissionJob;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    @RabbitListener(queues = {"submission_queue"})
    public void consumeSubmission(SubmissionJob job) {
        LOGGER.info("Received submission job: {}", job.submissionId());
        try {
            judgeService.processSubmission(job);
        } catch (Exception e) {
            LOGGER.error("Failed to process submission {}: {}", job.submissionId(), e.getMessage(), e);
            // Handle failure - maybe update DB to "Internal Error"
            judgeService.updateSubmissionStatusToError(job.submissionId(), "Internal Judge Error");
        }
    }
}