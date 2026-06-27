#!/bin/bash
# Kill existing processes
pkill -f "next dev" 2>/dev/null
pkill -f "node server" 2>/dev/null
sleep 2

cd /data/data/com.termux/files/home/anime-stream

# Start backend
node server/index.js &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend
sleep 2

# Start frontend
node node_modules/next/dist/bin/next dev --port 3000 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "=========================================="
echo "  Z.XTREAM is running!"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3002"
echo "=========================================="
echo ""
echo "Press Ctrl+C to stop"

wait
