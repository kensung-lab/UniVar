#!/bin/bash
set -euo pipefail

# Remove all files and directories created by Nextflow
rm -rf .nextflow*
rm -rf work
rm -rf .nextflow
rm -rf .nextflow.log*