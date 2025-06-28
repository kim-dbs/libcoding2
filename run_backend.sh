#!/bin/bash

# 백엔드 실행 스크립트
echo "Starting backend server..."

# 현재 디렉토리 확인
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# app 디렉토리가 있는지 확인
if [ -d "app" ]; then
    echo "Found app directory"
    cd app
elif [ -f "main.py" ]; then
    echo "Already in app directory"
else
    echo "Error: Cannot find app directory or main.py"
    echo "Current directory contents:"
    ls -la
    exit 1
fi

# Python 의존성 설치
echo "Installing Python dependencies..."
pip install -r requirements.txt

# 서버 실행
echo "Starting FastAPI server on port 8080..."
python main.py &

# 서버가 시작될 때까지 잠시 대기
sleep 5

echo "Backend server started successfully"
