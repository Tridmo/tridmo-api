-- Database initialization script
-- This script runs when the PostgreSQL container starts for the first time

-- Create the main database if it doesn't exist
SELECT 'CREATE DATABASE tridmo_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'tridmo_db')\gexec

-- Connect to the database
\c tridmo_db;

-- Create extensions that might be needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE tridmo_db TO postgres; 