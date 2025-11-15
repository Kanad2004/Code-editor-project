import mongoose, { Schema } from "mongoose";

const submissionSchema = new Schema(
  {
    problem_id: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    source_code: { type: String, required: true },
    language: { type: String, required: true }, // e.g., "cpp", "java"
    status: {
      type: String,
      enum: [
        "Pending",
        "Judging",
        "Accepted",
        "Wrong Answer",
        "Time Limit Exceeded",
        "Memory Limit Exceeded",
        "Compilation Error",
        "Runtime Error",
      ],
      default: "Pending",
    },
    verdict: { type: String, default: "" }, // e.g., "Failed on test case 3"
    run_time: { type: Number }, // in milliseconds
    memory_used: { type: Number }, // in KB
  },
  { timestamps: true }
);

export const Submission = mongoose.model("Submission", submissionSchema);