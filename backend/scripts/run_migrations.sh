#!/bin/bash

# This script runs the database migrations for the todo-api-go application.

set -e

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# Database connection details
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-your_username}
DB_PASSWORD=${DB_PASSWORD:-your_password}
DB_NAME=${DB_NAME:-your_database}

# Run the migration
echo "Running migrations..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/0001_create_tasks_table.sql

echo "Migrations completed successfully."