# Python 3.12 slim image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --upgrade pip
# We force CPU version of torch to keep image light
RUN pip install torch==2.2.1+cpu -f https://download.pytorch.org/whl/torch_stable.html
RUN pip install -r requirements.txt

# Copy project
COPY backend /app/backend

RUN chmod -R 755 /app/backend
RUN chown -R www-data:www-data /app/backend

WORKDIR /app/backend
RUN python manage.py collectstatic --noinput || true
