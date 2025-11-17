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
    difficulty: { 
      type: String, 
      enum: ["Easy", "Medium", "Hard"], 
      required: true 
    },
    time_limit: { type: Number, required: true, default: 5 }, // seconds
    memory_limit: { type: Number, required: true, default: 256 }, // MB
    sample_cases: [sampleCaseSchema],
    hidden_test_cases: {
      type: [testCaseSchema],
      required: true,
      select: false, // Hide from API responses
    },
    tags: [{ type: String }], // e.g., ["arrays", "dynamic-programming"]
    total_submissions: { type: Number, default: 0 },
    accepted_submissions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Virtual field for acceptance rate
problemSchema.virtual('acceptance_rate').get(function() {
  if (this.total_submissions === 0) return 0;
  return ((this.accepted_submissions / this.total_submissions) * 100).toFixed(1);
});

// Ensure virtuals are included in JSON
problemSchema.set('toJSON', { virtuals: true });
problemSchema.set('toObject', { virtuals: true });

// Pre-save hook to generate slug
problemSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export const Problem = mongoose.model("Problem", problemSchema);
