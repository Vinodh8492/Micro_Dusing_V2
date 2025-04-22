# Base image
FROM python:3.11

# Set working directory
WORKDIR /app

# Copy dependencies file and install
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Copy the app code
COPY . .

# Expose the port used by your backend
EXPOSE 5000

# Run the app
CMD ["python", "app.py"]
