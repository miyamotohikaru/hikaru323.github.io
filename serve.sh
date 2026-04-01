#!/bin/bash
# ローカル開発サーバーを起動するスクリプト
# Usage: ./serve.sh [port]

PORT=${1:-8000}

echo "Starting local server at http://localhost:${PORT}"
echo "Press Ctrl+C to stop."

python3 -m http.server "$PORT"
