import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Submission } from "../models/submission.model.js";
import { User } from "../models/user.model.js";

const getLeaderboard = asyncHandler(async (req, res) => {
  const { period = 'all-time' } = req.query;

  // Calculate date filter based on period
  let dateFilter = {};
  const now = new Date();
  
  if (period === 'weekly') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    dateFilter = { createdAt: { $gte: weekAgo } };
  } else if (period === 'monthly') {
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    dateFilter = { createdAt: { $gte: monthAgo } };
  }

  // Aggregate user statistics
  const leaderboard = await Submission.aggregate([
    { $match: { ...dateFilter, status: "Accepted" } },
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
          user_id: "$user_id",
          problem_id: "$problem_id",
          difficulty: "$problem.difficulty"
        }
      }
    },
    {
      $group: {
        _id: "$_id.user_id",
        easy: {
          $sum: {
            $cond: [{ $eq: ["$_id.difficulty", "Easy"] }, 1, 0]
          }
        },
        medium: {
          $sum: {
            $cond: [{ $eq: ["$_id.difficulty", "Medium"] }, 1, 0]
          }
        },
        hard: {
          $sum: {
            $cond: [{ $eq: ["$_id.difficulty", "Hard"] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        user_id: "$_id",
        easy: 1,
        medium: 1,
        hard: 1,
        problems_solved: { $add: ["$easy", "$medium", "$hard"] },
        score: {
          $add: [
            { $multiply: ["$easy", 1] },
            { $multiply: ["$medium", 3] },
            { $multiply: ["$hard", 5] }
          ]
        }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "submissions",
        let: { userId: "$user_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$user_id", "$$userId"] } } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              accepted: {
                $sum: { $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0] }
              }
            }
          }
        ],
        as: "submission_stats"
      }
    },
    { $unwind: { path: "$submission_stats", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: "$user._id",
        username: "$user.username",
        easy: 1,
        medium: 1,
        hard: 1,
        problems_solved: 1,
        score: 1,
        acceptance_rate: {
          $cond: {
            if: { $gt: ["$submission_stats.total", 0] },
            then: {
              $multiply: [
                { $divide: ["$submission_stats.accepted", "$submission_stats.total"] },
                100
              ]
            },
            else: 0
          }
        }
      }
    },
    { $sort: { score: -1, problems_solved: -1 } },
    { $limit: 100 }
  ]);

  return res.status(200).json(
    new ApiResponse(200, leaderboard, "Leaderboard fetched successfully")
  );
});

export { getLeaderboard };
