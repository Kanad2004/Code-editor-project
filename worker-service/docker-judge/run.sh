#!/bin/sh

# $1 will be the time limit in seconds (e.g., 2)
TIME_LIMIT=$1

# 1. Compile the C++ code
# We redirect stderr to 'compile.err' to capture compile errors
g++ main.cpp -o main 2> compile.err
compile_status=$?

# 2. Check if compilation failed (non-zero exit code)
if [ $compile_status -ne 0 ]; then
  # Report "COMPILATION_ERROR" as the first line (the "status")
  echo "COMPILATION_ERROR"
  # Print the compiler's error message as the rest of the output
  cat compile.err
  exit 0
fi

# 3. Run the compiled code
# We run 'timeout' to enforce the time limit ($TIME_LIMIT)
# We feed 'input.txt' to stdin
# We redirect stdout to 'output.txt'
# We redirect stderr (for runtime errors) to 'run.err'
timeout $TIME_LIMITs ./main < input.txt > output.txt 2> run.err
run_status=$?

# 4. Analyze the exit status
if [ $run_status -eq 124 ]; then
  # Exit code 124 means 'timeout' was triggered
  echo "TIME_LIMIT_EXCEEDED"
elif [ $run_status -ne 0 ]; then
  # Any other non-zero exit means a runtime error
  echo "RUNTIME_ERROR"
  cat run.err
else
  # Exit code 0 means success
  echo "SUCCESS"
  cat output.txt
fi

exit 0