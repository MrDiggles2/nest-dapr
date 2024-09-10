#!/bin/bash

show_help() {
  cat << EOF
Usage: $0 <file_path> <timeout_seconds>

Monitors a specified file for changes and executes a command when the file changes.
The script will exit if no changes are detected within the specified timeout period.

Arguments:
  <file_path>        Path to the file to monitor.
  <timeout_seconds>  Timeout period in seconds. The script will exit if no changes
                     are detected within this time.

Examples:
  $0 /path/to/your/file 60
    Monitors /path/to/your/file for changes and exits if no changes are detected
    within 60 seconds.

  $0 /path/to/another/file 120
    Monitors /path/to/another/file for changes and exits if no changes are detected
    within 120 seconds.

Exit Codes:
  0   Successful execution.
  1   Invalid arguments or file does not exist.

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

# Path to the file to monitor
FILE_TO_MONITOR="$1"

# Timeout period in seconds
TIMEOUT="$2"

# Initial modification time
last_mod_time=$(date +%s)
if [ -e "$FILE_TO_MONITOR" ]; then
  last_mod_time=$(stat -f %m "$FILE_TO_MONITOR")
fi

# To track timeout
start_time=$(date +%s)

echo "Waiting for $FILE_TO_MONITOR to change"

while true; do
  # Get current modification time
  current_mod_time=$last_mod_time
  if [ -e "$FILE_TO_MONITOR" ]; then
    current_mod_time=$(stat -f %m "$FILE_TO_MONITOR")
  fi

  # Check if the modification time has changed
  if [ "$last_mod_time" != "$current_mod_time" ]; then
    echo "Change detected for $FILE_TO_MONITOR"
    exit 0
  fi

  # Check if timeout period has been exceeded
  current_time=$(date +%s)
  elapsed_time=$((current_time - start_time))
  if [ "$elapsed_time" -ge "$TIMEOUT" ]; then
    echo "Timeout reached waiting for $FILE_TO_MONITOR"
    exit 1
  fi

  # Sleep for a short period to avoid excessive CPU usage
  sleep 1
done
