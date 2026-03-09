# ── Base image: Python 3.12 with GDAL/PostGIS support ─────────────────────────
FROM python:3.12-slim

# System dependencies: GDAL, PostGIS client libs, build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    libproj-dev \
    binutils \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# GDAL environment variables (required by GeoDjango)
ENV GDAL_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/libgdal.so
ENV GEOS_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/libgeos_c.so
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

# Working directory
WORKDIR /app

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the full project
COPY . .

# Expose Gradio port
EXPOSE 7860

# Start script: migrate then launch
CMD ["sh", "-c", "cd backend && python manage.py migrate --noinput && cd .. && python gradio_app/app.py"]
