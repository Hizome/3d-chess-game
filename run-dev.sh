#!/bin/bash

# This script starts the development servers for both the frontend and backend.

# Exit script on any error
set -e

# Function to clean up background processes on exit
cleanup() {
    echo "Shutting down servers..."
    # Kill the frontend process that we sent to the background
    kill $FRONTEND_PID
    echo "Servers shut down."
}

# Trap the EXIT signal to run the cleanup function
trap cleanup EXIT

# Start the frontend server in the background
echo "Starting frontend server on http://localhost:5173"
(cd frontend && npm run dev) &
FRONTEND_PID=$!

# Wait a bit for the frontend to initialize before starting the backend
sleep 2

# Start the backend server in the foreground
echo "Starting backend server on http://localhost:8080"
(cd backend && cargo run)
