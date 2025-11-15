import mongoose, { Schema } from "mongoose";
import slugify from "slugify";

const sampleCaseSchema = new Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String },
});

const testCaseSchema = new Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
});

const problemSchema = new Schema(
  {
    title: { type: String, required: true, unique: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    time_limit: { type: Number, required: true, default: 2 }, // Time in seconds
    memory_limit: { type: Number, required: true, default: 256 }, // Memory in MB
    sample_cases: [sampleCaseSchema],
    hidden_test_cases: {
      type: [testCaseSchema],
      required: true,
      select: false, // --- CRITICAL: Hide from API responses by default
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate slug
problemSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export const Problem = mongoose.model("Problem", problemSchema);