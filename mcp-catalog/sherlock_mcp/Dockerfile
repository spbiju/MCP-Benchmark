# Generated by https://smithery.ai. See: https://smithery.ai/docs/build/project-config
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir \
    colorama>=0.4.6 \
    fastmcp>=2.8.0 \
    pandas>=2.3.0 \
    requests>=2.32.4 \
    requests-futures>=1.0.2

# Copy project files
COPY . .

# Default command to run the MCP server
ENTRYPOINT ["python3", "main.py"]
