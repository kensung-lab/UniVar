#!/bin/bash

# Set the directory to monitor
MONITOR_DIR=./data/control_files

# Monitor new folder using inotifywait
echo "$(date): Starting to monitor $MONITOR_DIR for new files..."
./inotify/bin/inotifywait -m -e create --format '%f' "$MONITOR_DIR" | while read -r folder_name; do

  echo "Detected folder: $folder_name, wait for 2 seconds..."
  sleep 2
  echo "Start processing folder: $folder_name"

  # Iterate control files in the new folder
  folder_path="$MONITOR_DIR/$folder_name"
  find "$folder_path" -type f | while read -r filepath; do

    filename=$(basename "$filepath")
    if [ "$filename" == "snp.json" ]; then
      echo "Run SNP: $filepath"
      ./run_snp.sh "$filepath"
    else
      echo "Run SV: $filepath"
      ./run_sv.sh "$filepath"
    fi
  done

  echo "Run Complete"
  any_filepath=$(find "$folder_path" -type f | head -n 1)
  echo any_file $any_filepath
  ./complete.sh "$any_filepath"

done
