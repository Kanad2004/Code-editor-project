package com.judge.workerservice.service;

import com.judge.workerservice.domain.*;
import com.judge.workerservice.dto.SubmissionJob;
import com.judge.workerservice.repository.ProblemRepository;
import com.judge.workerservice.repository.SubmissionRepository;
import com.judge.workerservice.util.Constants;
import com.judge.workerservice.util.OutputValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class JudgeService {

    private static final Logger LOGGER = LoggerFactory.getLogger(JudgeService.class);
    
    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;
    private final DockerSandboxService sandboxService;
    private final OutputValidator outputValidator;

    @Autowired
    public JudgeService(
            SubmissionRepository submissionRepository,
            ProblemRepository problemRepository,
            DockerSandboxService sandboxService,
            OutputValidator outputValidator) {
        this.submissionRepository = submissionRepository;
        this.problemRepository = problemRepository;
        this.sandboxService = sandboxService;
        this.outputValidator = outputValidator;
    }

    public void processSubmission(SubmissionJob job) throws Exception {
        // 1. Find submission and update status to "Judging"
        Submission submission = submissionRepository.findById(job.submissionId())
                .orElseThrow(() -> new RuntimeException("Submission not found: " + job.submissionId()));
        
        submission.setStatus(Constants.STATUS_JUDGING);
        submissionRepository.save(submission);

        // 2. Get problem's hidden test cases
        Problem problem = problemRepository.findById(job.problemId())
                .orElseThrow(() -> new RuntimeException("Problem not found: " + job.problemId()));

        // Use problem-specific limits or defaults
        int timeLimit = problem.getTimeLimit() != null ? problem.getTimeLimit() : job.timeLimit();
        int memoryLimit = problem.getMemoryLimit() != null ? problem.getMemoryLimit() : job.memoryLimit();

        String finalVerdict = Constants.STATUS_ACCEPTED;
        String finalOutput = "All test cases passed";
        List<TestCaseResult> testResults = new ArrayList<>();
        int testCasesPassed = 0;
        long maxExecutionTime = 0;
        long maxMemoryUsed = 0;

        List<TestCase> testCases = problem.getHiddenTestCases();
        if (testCases == null || testCases.isEmpty()) {
            throw new RuntimeException("No test cases found for problem");
        }

        // 3. Loop through all test cases
        for (int i = 0; i < testCases.size(); i++) {
            TestCase testCase = testCases.get(i);
            
            LOGGER.debug("Running test case {}/{}", i + 1, testCases.size());
            
            JudgeResult result = sandboxService.run(
                    job.sourceCode(),
                    job.language(),
                    testCase.getInput(),
                    timeLimit,
                    memoryLimit
            );

            // Track max execution time and memory
            if (result.executionTimeMs() != null) {
                maxExecutionTime = Math.max(maxExecutionTime, result.executionTimeMs());
            }
            if (result.memoryUsedKb() != null) {
                maxMemoryUsed = Math.max(maxMemoryUsed, result.memoryUsedKb());
            }

            // 4. Analyze result from sandbox
            String testStatus;
            String actualOutput = result.output();
            
            switch (result.status()) {
                case Constants.DOCKER_COMPILATION_ERROR:
                    finalVerdict = Constants.STATUS_COMPILATION_ERROR;
                    finalOutput = truncateOutput(result.output(), 1000);
                    testStatus = Constants.STATUS_COMPILATION_ERROR;
                    break;
                    
                case Constants.DOCKER_TIME_LIMIT:
                    finalVerdict = Constants.STATUS_TIME_LIMIT;
                    finalOutput = "Time limit exceeded on test case " + (i + 1);
                    testStatus = Constants.STATUS_TIME_LIMIT;
                    break;
                    
                case Constants.DOCKER_RUNTIME_ERROR:
                    finalVerdict = Constants.STATUS_RUNTIME_ERROR;
                    finalOutput = truncateOutput(result.output(), 1000);
                    testStatus = Constants.STATUS_RUNTIME_ERROR;
                    break;
                    
                case Constants.DOCKER_INTERNAL_ERROR:
                    finalVerdict = Constants.STATUS_INTERNAL_ERROR;
                    finalOutput = "Judge Internal Error";
                    testStatus = Constants.STATUS_INTERNAL_ERROR;
                    break;
                    
                case Constants.DOCKER_SUCCESS:
                    // Validate output
                    if (outputValidator.validate(testCase.getOutput(), result.output())) {
                        testStatus = Constants.STATUS_ACCEPTED;
                        testCasesPassed++;
                    } else {
                        finalVerdict = Constants.STATUS_WRONG_ANSWER;
                        finalOutput = "Wrong answer on test case " + (i + 1);
                        testStatus = Constants.STATUS_WRONG_ANSWER;
                    }
                    break;
                    
                default:
                    testStatus = "Unknown";
            }

            // Store individual test result
            TestCaseResult testResult = new TestCaseResult(
                i + 1,
                testStatus,
                truncateOutput(testCase.getInput(), 100),
                truncateOutput(testCase.getOutput(), 100),
                truncateOutput(actualOutput, 100),
                result.executionTimeMs()
            );
            testResults.add(testResult);

            // If we found an error, stop processing test cases
            if (!finalVerdict.equals(Constants.STATUS_ACCEPTED)) {
                break;
            }
        }

        // 5. Update submission with final result
        submission.setStatus(finalVerdict);
        submission.setVerdict(finalOutput);
        submission.setExecutionTime(maxExecutionTime);
        submission.setMemoryUsed(maxMemoryUsed);
        submission.setTestCasesPassed(testCasesPassed);
        submission.setTotalTestCases(testCases.size());
        submission.setJudgedAt(LocalDateTime.now());
        submission.setTestResults(testResults);
        
        submissionRepository.save(submission);
        
        LOGGER.info("Submission processed. Verdict: {}, Passed: {}/{}", 
                    finalVerdict, testCasesPassed, testCases.size());
    }
    
    public void processTestSubmission(SubmissionJob job) {
        // Similar to processSubmission but only runs sample test cases
        // and returns full output for debugging
        LOGGER.info("Processing test submission (sample cases only)");
        // Implementation similar to above but with sample_cases instead of hidden_test_cases
    }
    
    public void updateSubmissionStatusToError(String submissionId, String errorMessage) {
        submissionRepository.findById(submissionId).ifPresent(submission -> {
            submission.setStatus(Constants.STATUS_INTERNAL_ERROR);
            submission.setVerdict(errorMessage);
            submission.setJudgedAt(LocalDateTime.now());
            submissionRepository.save(submission);
        });
    }
    
    private String truncateOutput(String output, int maxLength) {
        if (output == null) return "";
        if (output.length() <= maxLength) return output;
        return output.substring(0, maxLength) + "\n... (truncated)";
    }
}
