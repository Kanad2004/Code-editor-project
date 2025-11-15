package com.judge.workerservice.service;

import com.judge.workerservice.domain.JudgeResult;
import com.judge.workerservice.domain.Problem;
import com.judge.workerservice.domain.Submission;
import com.judge.workerservice.domain.TestCase;
import com.judge.workerservice.dto.SubmissionJob;
import com.judge.workerservice.repository.ProblemRepository;
import com.judge.workerservice.repository.SubmissionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class JudgeService {

    private static final Logger LOGGER = LoggerFactory.getLogger(JudgeService.class);
    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;
    private final DockerSandboxService sandboxService;

    @Autowired
    public JudgeService(SubmissionRepository submissionRepository, ProblemRepository problemRepository, DockerSandboxService sandboxService) {
        this.submissionRepository = submissionRepository;
        this.problemRepository = problemRepository;
        this.sandboxService = sandboxService;
    }

    public void processSubmission(SubmissionJob job) throws Exception {
        // 1. Find submission and update status to "Judging"
        Submission submission = submissionRepository.findById(job.submissionId())
                .orElseThrow(() -> new RuntimeException("Submission not found: " + job.submissionId()));
        submission.setStatus("Judging");
        submissionRepository.save(submission);

        // 2. Get problem's hidden test cases
        Problem problem = problemRepository.findTestCasesById(job.problemId())
                .orElseThrow(() -> new RuntimeException("Problem not found: " + job.problemId()));

        String finalVerdict = "Accepted";
        String finalOutput = "All test cases passed";

        // 3. Loop through all test cases
        for (TestCase testCase : problem.getHiddenTestCases()) {
            JudgeResult result = sandboxService.run(
                    job.sourceCode(),
                    testCase.getInput(),
                    job.timeLimit(),
                    job.memoryLimit()
            );

            // 4. Analyze result from sandbox
            switch (result.status()) {
                case "COMPILATION_ERROR":
                    finalVerdict = "Compilation Error";
                    finalOutput = result.output();
                    break;
                case "TIME_LIMIT_EXCEEDED":
                    finalVerdict = "Time Limit Exceeded";
                    finalOutput = "Time limit exceeded on a hidden test case.";
                    break;
                case "RUNTIME_ERROR":
                    finalVerdict = "Runtime Error";
                    finalOutput = result.output();
                    break;
                case "INTERNAL_ERROR":
                    finalVerdict = "Runtime Error"; // Treat judge error as runtime error
                    finalOutput = "Judge Internal Error: " + result.output();
                    break;
                case "SUCCESS":
                    // Trim whitespace from both expected and actual output
                    String expected = testCase.getOutput().trim();
                    String actual = result.output().trim();
                    
                    if (!expected.equals(actual)) {
                        finalVerdict = "Wrong Answer";
                        finalOutput = "Wrong answer on a hidden test case.";
                    }
                    // If it's correct, we just continue the loop
                    break;
            }

            // If we found an error, stop processing test cases
            if (!finalVerdict.equals("Accepted")) {
                break;
            }
        }

        // 5. Update submission with final result
        submission.setStatus(finalVerdict);
        submission.setVerdict(finalOutput);
        // TODO: Extract runTime and memory from sandbox result
        // For now, we just set the verdict.
        submissionRepository.save(submission);
        LOGGER.info("Submission {} processed. Verdict: {}", job.submissionId(), finalVerdict);
    }
    
    public void updateSubmissionStatusToError(String submissionId, String errorMessage) {
        submissionRepository.findById(submissionId).ifPresent(submission -> {
            submission.setStatus("Runtime Error"); // Or a custom "Internal Error" status
            submission.setVerdict(errorMessage);
            submissionRepository.save(submission);
        });
    }
}