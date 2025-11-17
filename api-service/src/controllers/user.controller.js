import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Submission } from "../models/submission.model.js";
import { Problem } from "../models/problem.model.js";

const getUserStats = asyncHandler(async (req, res) => {
  const user_id = req.user._id;

  // Get all accepted submissions grouped by problem and difficulty
  const acceptedSubmissions = await Submission.aggregate([
    {
      $match: {
        user_id: user_id,
        status: "Accepted"
      }
    },
    {
      $lookup: {
        from: "problems",
        localField: "problem_id",
        foreignField: "_id",
        as: "problem"
      }
    },
    { $unwind: "$problem" },
    {
      $group: {
        _id: {
          problem_id: "$problem_id",
          difficulty: "$problem.difficulty"
        }
      }
    },
    {
      $group: {
        _id: "$_id.difficulty",
        count: { $sum: 1 }
      }
    }
  ]);

  const solved = {
    easy: 0,
    medium: 0,
    hard: 0,
    total: 0
  };

  acceptedSubmissions.forEach(item => {
    const difficulty = item._id.toLowerCase();
    solved[difficulty] = item.count;
    solved.total += item.count;
  });

  // Get submission statistics
  const totalSubmissions = await Submission.countDocuments({ user_id });
  const acceptedCount = await Submission.countDocuments({ 
    user_id, 
    status: "Accepted" 
  });

  const acceptance_rate = totalSubmissions > 0 
    ? ((acceptedCount / totalSubmissions) * 100).toFixed(1)
    : 0;

  // Get language usage
  const languages_used = await Submission.aggregate([
    { $match: { user_id } },
    {
      $group: {
        _id: "$language",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    {
      $project: {
        _id: 0,
        language: "$_id",
        count: 1
      }
    }
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      solved,
      total_submissions: totalSubmissions,
      accepted_submissions: acceptedCount,
      acceptance_rate: parseFloat(acceptance_rate),
      languages_used
    }, "User stats fetched successfully")
  );
});

const getRecentActivity = asyncHandler(async (req, res) => {
  const user_id = req.user._id;
  const limit = parseInt(req.query.limit) || 10;

  const recentSubmissions = await Submission.find({ user_id })
    .populate("problem_id", "title slug")
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("status language createdAt problem_id")
    .lean();

  const activity = recentSubmissions.map(sub => ({
    problem_title: sub.problem_id?.title,
    problem_slug: sub.problem_id?.slug,
    status: sub.status,
    language: sub.language,
    submitted_at: sub.createdAt
  }));

  return res.status(200).json(
    new ApiResponse(200, activity, "Recent activity fetched successfully")
  );
});

export { getUserStats, getRecentActivity };
