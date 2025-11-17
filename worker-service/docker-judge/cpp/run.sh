#!/bin/bash

# Arguments: $1 = time limit in seconds
TIME_LIMIT=${1:-5}

# Compile C++ code
g++ -O2 -std=c++17 -o solution main.cpp 2> compile_error.txt

# Check compilation
if [ $? -ne 0 ]; then
    echo "COMPILATION_ERROR"
    cat compile_error.txt
    exit 1
fi

# Run with timeout and input
timeout ${TIME_LIMIT}s ./solution < input.txt > output.txt 2> runtime_error.txt
EXIT_CODE=$?

# Check exit status
if [ $EXIT_CODE -eq 124 ]; then
    # Timeout occurred
    echo "TIME_LIMIT_EXCEEDED"
    echo "Execution exceeded ${TIME_LIMIT} seconds"
    exit 0
elif [ $EXIT_CODE -ne 0 ]; then
    # Runtime error
    echo "RUNTIME_ERROR"
    cat runtime_error.txt
    exit 0
fi

# Success - output the result
echo "SUCCESS"
cat output.txt
exit 0
