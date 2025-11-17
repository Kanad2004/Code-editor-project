export const SUBMISSION_QUEUE = process.env.SUBMISSION_QUEUE || "submission_queue";
export const TEST_QUEUE = process.env.TEST_QUEUE || "test_queue";

export const DB_NAME = "code_judge";
export const SUBMISSION_STATUS = {
  PENDING: "Pending",
  JUDGING: "Judging",
  ACCEPTED: "Accepted",
  WRONG_ANSWER: "Wrong Answer",
  TIME_LIMIT: "Time Limit Exceeded",
  MEMORY_LIMIT: "Memory Limit Exceeded",
  COMPILATION_ERROR: "Compilation Error",
  RUNTIME_ERROR: "Runtime Error",
  INTERNAL_ERROR: "Internal Error"
};

export const LANGUAGES = ['cpp', 'java', 'python', 'javascript'];

export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];
