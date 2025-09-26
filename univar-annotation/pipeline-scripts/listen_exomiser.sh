#!/bin/bash

source .env
# Set the directory to monitor
MONITOR_DIR=$WORKING_DIR/data/annotation/samples/exomiser_control_files
cd $WORKING_DIR/tools/pipeline/annotation/exomiser-next

# Monitor new folder using inotifywait
echo "$(date): Starting to monitor $MONITOR_DIR for new files..."
inotifywait -m -e create --format '%f' "$MONITOR_DIR" | while read -r folder_name; do

  echo "Detected folder: $folder_name, wait for 2 seconds..."
  sleep 2
  echo "Start processing folder: $folder_name"

  # Iterate control files in the new folder
  folder_path="$MONITOR_DIR/$folder_name"
  find "$folder_path" -type f | while read -r filepath; do

    filename=$(basename "$filepath")
    nextflow run -params-file "$filepath" --mongo_base_url=$NEXTFLOW_MONGO --variant_import_tool=$VARIANT_IMPORT_TOOL_PATH --data_dir="$WORKING_DIR/data"  main.nf -with-timeline stat/time-$(date +%s).html
  done

  echo "Completed Exomiser Pipeline"

done
