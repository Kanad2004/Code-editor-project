#!/bin/bash

TIME_LIMIT=${1:-10}

# Compile Java code
javac Main.java 2> compile_error.txt

if [ $? -ne 0 ]; then
    echo "COMPILATION_ERROR"
    cat compile_error.txt
    exit 1
fi

# Run with timeout
timeout ${TIME_LIMIT}s java Main < input.txt > output.txt 2> runtime_error.txt
EXIT_CODE=$?

if [ $EXIT_CODE -eq 124 ]; then
    echo "TIME_LIMIT_EXCEEDED"
    echo "Execution exceeded ${TIME_LIMIT} seconds"
    exit 0
elif [ $EXIT_CODE -ne 0 ]; then
    echo "RUNTIME_ERROR"
    cat runtime_error.txt
    exit 0
fi

echo "SUCCESS"
cat output.txt
exit 0
