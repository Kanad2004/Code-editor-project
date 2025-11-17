import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Problem } from "../models/problem.model.js";

const createProblem = asyncHandler(async (req, res) => {
  const { 
    title, 
    description, 
    difficulty, 
    sample_cases, 
    hidden_test_cases, 
    time_limit, 
    memory_limit,
    tags 
  } = req.body;
  
  if (!title || !description || !difficulty || !hidden_test_cases) {
    throw new ApiError(400, "Required fields missing");
  }

  const problem = await Problem.create({
    title,
    description,
    difficulty,
    sample_cases: sample_cases || [],
    hidden_test_cases,
    time_limit: time_limit || 5,
    memory_limit: memory_limit || 256,
    tags: tags || []
  });

  return res
    .status(201)
    .json(new ApiResponse(201, problem, "Problem created successfully"));
});

const getAllProblems = asyncHandler(async (req, res) => {
  const problems = await Problem.find({})
    .select("title slug difficulty tags acceptance_rate total_submissions")
    .lean();

  // Calculate acceptance rate for each problem
  const problemsWithStats = problems.map(problem => ({
    ...problem,
    acceptance_rate: problem.total_submissions > 0 
      ? ((problem.accepted_submissions / problem.total_submissions) * 100).toFixed(1)
      : 0
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, problemsWithStats, "Problems fetched successfully"));
});

const getProblemBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  
  const problem = await Problem.findOne({ slug })
    .select("-hidden_test_cases");

  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, problem, "Problem fetched successfully"));
});

const updateProblem = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  
  const problem = await Problem.findOneAndUpdate(
    { slug },
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, problem, "Problem updated successfully"));
});

const deleteProblem = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  
  const problem = await Problem.findOneAndDelete({ slug });

  if (!problem) {
    throw new ApiError(404, "Problem not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Problem deleted successfully"));
});

export { 
  createProblem, 
  getAllProblems, 
  getProblemBySlug,
  updateProblem,
  deleteProblem
};
