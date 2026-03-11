#!/bin/bash
echo "=== STEP 3: launching python ==="
cd /app
python3 -c "print('python works')"
echo "=== importing sys ==="
python3 -c "import sys; print(sys.version)"
echo "=== testing app import ==="
python3 -c "
import sys
sys.path.insert(0, '/app/backend')
print('path ok')
import gradio
print('gradio ok')
" 2>&1
echo "=== STEP 4: launching app ==="
python3 gradio_app/app.py 2>&1 || echo "APP CRASHED WITH CODE $?"