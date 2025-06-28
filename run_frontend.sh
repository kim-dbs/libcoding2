#!/bin/bash

# 프론트엔드 실행 스크립트
echo "Starting frontend server..."

# 현재 디렉토리 확인
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# frontend 디렉토리가 있는지 확인
if [ -d "frontend" ]; then
    echo "Found frontend directory"
    cd frontend
elif [ -f "package.json" ]; then
    echo "Already in frontend directory"
else
    echo "Error: Cannot find frontend directory or package.json"
    echo "Current directory contents:"
    ls -la
    exit 1
fi

# Node.js 의존성 설치
echo "Installing Node.js dependencies..."
npm install

# 프론트엔드 서버 실행
echo "Starting React development server on port 3000..."
npm start &

# 서버가 시작될 때까지 대기
sleep 10

echo "Frontend server started successfully"
