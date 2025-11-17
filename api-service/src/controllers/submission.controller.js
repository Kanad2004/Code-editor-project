import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Submission } from "../models/submission.model.js";
import { Problem } from "../models/problem.model.js";
import { publishToQueue } from "../rabbitmq/index.js";
import { SUBMISSION_QUEUE, TEST_QUEUE } from "../constants.js";

const createSubmission = asyncHandler(async (req, res) => {
  const { problem_id, language, source_code } = req.body;
  const user_id = req.user._id;

  if (!problem_id || !language || !source_code) {
    throw new ApiError(400, "Problem, language, and code are required");
  }

  // Validate source code length
  if (source_code.length > 50000) {
    throw new ApiError(400, "Source code too large (max 50KB)");
  }

  // Find problem to get its limits
  const problem = await Problem.findById(problem_id).select(
    "time_limit memory_limit"
  );
  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  // Create the submission in DB
  const submission = await Submission.create({
    problem_id,
    user_id,
    language,
    source_code,
    status: "Pending",
    is_test_run: false
  });

  // Update problem submission count
  await Problem.findByIdAndUpdate(problem_id, {
    $inc: { total_submissions: 1 }
  });

  // Create the job payload for the worker
  const job = {
    submission_id: submission._id.toString(),
    problem_id: problem._id.toString(),
    source_code: source_code,
    language: language,
    time_limit: problem.time_limit || 5,
    memory_limit: problem.memory_limit || 256,
  };

  // Publish the job to RabbitMQ
  try {
    await publishToQueue(SUBMISSION_QUEUE, job);
  } catch (error) {
    // If queue fails, mark submission as error
    await Submission.findByIdAndUpdate(submission._id, {
      status: "Internal Error",
      verdict: "Failed to queue submission"
    });
    throw new ApiError(503, "Service temporarily unavailable");
  }

  return res
    .status(202)
    .json(
      new ApiResponse(
        202,
        { submission_id: submission._id },
        "Submission received and is pending"
      )
    );
});

const testSubmission = asyncHandler(async (req, res) => {
  const { problem_id, language, source_code } = req.body;
  const user_id = req.user._id;

  if (!problem_id || !language || !source_code) {
    throw new ApiError(400, "Problem, language, and code are required");
  }

  const problem = await Problem.findById(problem_id).select(
    "time_limit memory_limit sample_cases"
  );
  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  // Create test submission (not saved permanently or marked as test)
  const submission = await Submission.create({
    problem_id,
    user_id,
    language,
    source_code,
    status: "Pending",
    is_test_run: true
  });

  const job = {
    submission_id: submission._id.toString(),
    problem_id: problem._id.toString(),
    source_code: source_code,
    language: language,
    time_limit: problem.time_limit || 5,
    memory_limit: problem.memory_limit || 256,
    is_test: true
  };

  try {
    await publishToQueue(TEST_QUEUE, job);
  } catch (error) {
    throw new ApiError(503, "Service temporarily unavailable");
  }

  return res
    .status(202)
    .json(
      new ApiResponse(
        202,
        { submission_id: submission._id },
        "Test run submitted"
      )
    );
});

const getSubmissionStatus = asyncHandler(async (req, res) => {
  const { submission_id } = req.params;

  const submission = await Submission.findById(submission_id)
    .select("status verdict execution_time memory_used test_cases_passed total_test_cases judged_at")
    .lean();

  if (!submission) {
    throw new ApiError(404, "Submission not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, submission, "Submission status fetched")
    );
});

const getMySubmissions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const user_id = req.user._id;

  const query = { user_id };
  if (status) {
    query.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [submissions, total] = await Promise.all([
    Submission.find(query)
      .populate("problem_id", "title slug difficulty")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Submission.countDocuments(query)
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, {
        data: submissions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }, "Submissions fetched successfully")
    );
});

export { 
  createSubmission, 
  testSubmission,
  getSubmissionStatus, 
  getMySubmissions 
};
