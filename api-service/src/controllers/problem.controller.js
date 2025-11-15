import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Problem } from "../models/problem.model.js";

// Note: In a real app, this would be admin-only
const createProblem = asyncHandler(async (req, res) => {
  const { title, description, difficulty, sample_cases, hidden_test_cases, time_limit, memory_limit } = req.body;
  
  const problem = await Problem.create({
    title,
    description,
    difficulty,
    sample_cases,
    hidden_test_cases,
    time_limit,
    memory_limit
  });

  return res
    .status(201)
    .json(new ApiResponse(201, problem, "Problem created successfully"));
});

const getAllProblems = asyncHandler(async (req, res) => {
  // hidden_test_cases are automatically excluded due to `select: false`
  const problems = await Problem.find({}).select("title slug difficulty");

  return res
    .status(200)
    .json(new ApiResponse(200, problems, "Problems fetched successfully"));
});

const getProblemBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  // hidden_test_cases are automatically excluded
  const problem = await Problem.findOne({ slug });

  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, problem, "Problem fetched successfully"));
});

export { createProblem, getAllProblems, getProblemBySlug };