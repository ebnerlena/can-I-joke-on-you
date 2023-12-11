# Use Python image as base
FROM python:3.9-slim

# Set working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the recommender.py file to the working directory
COPY recommender.py .
COPY filtered_jokes_data.csv .
COPY filtered_clusters_data.csv .

# Expose the port the app runs on
EXPOSE 5000

# Define environment variables
ENV FLASK_APP=recommender.py
ENV FLASK_RUN_HOST=0.0.0.0

# Command to run the application
CMD ["flask", "run"]
