#!/bin/bash
# Local Voice Agent Runner via Functions Framework
# Usage: ./local-runner.sh

echo "Starting Voice Agent on port 5001..."
npx @google-cloud/functions-framework --target=processSpeech --port=5001 --source=functions/index.js
