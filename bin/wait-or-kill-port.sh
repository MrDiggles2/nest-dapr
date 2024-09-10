#!/bin/bash

show_help() {
  cat << EOF
Usage: $0 <port> <timeout_seconds> 

Monitors a specified port to close. If timeout is reached, the PID occupying
the port is killed.

Arguments:
  <port>              Port to monitor
  <timeout_seconds>   Timeout period in seconds.

Examples:
  $0 3000 60
    Monitors port 3000 for changes and kills the PID on the port if not freed
    within 60 seconds.

Exit Codes:
  0   Successful execution.
  1   Invalid arguments or timeout was reached

EOF
}

# Show help if no arguments are provided or if help is requested
if [ "$#" -eq 0 ] || [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
  show_help
  exit 0
fi

# Check for correct number of arguments
if [ "$#" -ne 2 ]; then
  echo "Error: Invalid number of arguments."
  show_help
  exit 1
fi

# Port to monitor
PORT="$1"

# Timeout period in seconds
TIMEOUT="$2"

# To track timeout
start_time=$(date +%s)

echo "Waiting for port $PORT to close"

while true; do
  # Check if port is closed
  if [[ -z $(lsof -t -i :$PORT) ]]; then
    echo "Port $PORT is closed."
    exit 0
  fi

  # Check if timeout period has been exceeded
  current_time=$(date +%s)
  elapsed_time=$((current_time - start_time))
  if [ "$elapsed_time" -ge "$TIMEOUT" ]; then
    echo "Timeout reached waiting for port $PORT. Killing pids."
    kill $(lsof -t -i :$PORT)
    exit 0
  fi

  # Sleep for a short period to avoid excessive CPU usage
  sleep 1
done
