#!/bin/bash
cd /home/kavia/workspace/code-generation/cricketinsight-popup-10430-a1f0ab35/react_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

