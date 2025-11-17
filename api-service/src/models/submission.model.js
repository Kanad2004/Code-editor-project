import mongoose, { Schema } from "mongoose";

const testResultSchema = new Schema({
  test_case_number: { type: Number },
  status: { type: String },
  input: { type: String },
  expected_output: { type: String },
  actual_output: { type: String },
  execution_time_ms: { type: Number },
}, { _id: false });

const submissionSchema = new Schema(
  {
    problem_id: { type: Schema.Types.ObjectId, ref: "Problem", required: true, index: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    source_code: { type: String, required: true },
    language: { 
      type: String, 
      required: true,
      enum: ['cpp', 'java', 'python', 'javascript']
    },
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
        "Internal Error"
      ],
      default: "Pending",
      index: true
    },
    verdict: { type: String, default: "" },
    execution_time: { type: Number }, // milliseconds
    memory_used: { type: Number }, // KB
    test_cases_passed: { type: Number, default: 0 },
    total_test_cases: { type: Number, default: 0 },
    test_results: [testResultSchema],
    judged_at: { type: Date },
    is_test_run: { type: Boolean, default: false }, // For "Run" vs "Submit"
  },
  { timestamps: true }
);

// Index for efficient queries
submissionSchema.index({ user_id: 1, createdAt: -1 });
submissionSchema.index({ problem_id: 1, status: 1 });

// Virtual for pass percentage
submissionSchema.virtual('pass_percentage').get(function() {
  if (this.total_test_cases === 0) return 0;
  return ((this.test_cases_passed / this.total_test_cases) * 100).toFixed(1);
});

submissionSchema.set('toJSON', { virtuals: true });
submissionSchema.set('toObject', { virtuals: true });

export const Submission = mongoose.model("Submission", submissionSchema);
