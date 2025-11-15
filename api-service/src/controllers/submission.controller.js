import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Submission } from "../models/submission.model.js";
import { Problem } from "../models/problem.model.js";
import { publishToQueue } from "../rabbitmq/index.js";
import { SUBMISSION_QUEUE } from "../constants.js";

const createSubmission = asyncHandler(async (req, res) => {
  const { problem_id, language, source_code } = req.body;
  const user_id = req.user._id;

  if (!problem_id || !language || !source_code) {
    throw new ApiError(400, "Problem, language, and code are required");
  }

  // Find problem to get its limits
  const problem = await Problem.findById(problem_id).select(
    "time_limit memory_limit"
  );
  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  // 1. Create the submission in DB
  const submission = await Submission.create({
    problem_id,
    user_id,
    language,
    source_code,
    status: "Pending",
  });

  // 2. Create the job payload for the worker
  const job = {
    submission_id: submission._id.toString(),
    problem_id: problem._id.toString(),
    source_code: source_code,
    language: language,
    time_limit: problem.time_limit,
    memory_limit: problem.memory_limit,
  };

  // 3. Publish the job to RabbitMQ
  await publishToQueue(SUBMISSION_QUEUE, job);

  // 4. Respond to client
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

const getSubmissionStatus = asyncHandler(async (req, res) => {
  const { submission_id } = req.params;

  const submission = await Submission.findById(submission_id).select(
    "status verdict run_time memory_used"
  );

  if (!submission) {
    throw new ApiError(404, "Submission not found");
  }

  // Security: Ensure user only sees their own submission
  // Note: This logic might change if you want to show *all* status
  // but for now, let's assume it's private.
  // const submissionForUser = await Submission.findOne({ _id: submission_id, user_id: req.user._id });
  // if (!submissionForUser) {
  //   throw new ApiError(403, "You are not authorized to view this submission");
  // }
  
  // Let's relax this: allow anyone to poll any submission by ID
  // This is simpler for the frontend.
  
  return res
    .status(200)
    .json(
      new ApiResponse(200, submission, "Submission status fetched")
    );
});

const getAllSubmissions = asyncHandler(async (req, res) => {
  // Get all submissions for the *logged-in user*
  const submissions = await Submission.find({ user_id: req.user._id })
    .populate("problem_id", "title slug") // Join problem title/slug
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, submissions, "Submissions fetched"));
});

export { createSubmission, getSubmissionStatus, getAllSubmissions };