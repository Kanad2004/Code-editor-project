#!/bin/bash

set -e  # Exit on error

echo "🐳 Building Docker images for code execution..."
echo ""

# Function to build image
build_image() {
    local lang=$1
    local image_name=$2
    
    echo "📦 Building $lang judge image..."
    cd $lang
    if docker build -t $image_name . ; then
        echo "✅ $lang image built successfully"
    else
        echo "❌ Failed to build $lang image"
        return 1
    fi
    cd ..
    echo ""
}

# Build all images
build_image "cpp" "cpp-judge-image"
build_image "java" "java-judge-image"
build_image "python" "python-judge-image"
build_image "javascript" "js-judge-image"

echo "🎉 All Docker images built successfully!"
echo ""
echo "📋 Available images:"
docker images | grep "judge-image"
