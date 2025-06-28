#!/bin/bash
cd "$(dirname "$0")"
export PYTHONPATH="$PWD:$PYTHONPATH"
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
