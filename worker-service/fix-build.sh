#!/bin/bash

echo "🔧 Fixing build errors..."

# Fix 1: Rename file
cd src/main/java/com/judge/worker_service/service
if [ -f "LanguageExecutionStatergy.java" ]; then
    mv LanguageExecutionStatergy.java LanguageExecutionStrategy.java
    echo "✅ Renamed LanguageExecutionStatergy.java to LanguageExecutionStrategy.java"
fi
cd ../../../../../../../../..

echo "✅ File renamed. Now update the domain classes with the code I provided above."
echo "Then run: ./mvnw clean package"
