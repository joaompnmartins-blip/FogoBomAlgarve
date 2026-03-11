#!/bin/bash
echo "=== STEP 1: migrations ==="
cd backend && python3 manage.py migrate --noinput
echo "=== STEP 2: starting app ==="
cd ..
echo "=== STEP 3: launching python ==="
python3 gradio_app/app.py
echo "=== STEP 4: app exited ==="