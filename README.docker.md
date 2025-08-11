# Docker Setup for Tridmo API

This document provides instructions for running the Tridmo API using Docker and Docker Compose.

## Prerequisites

- Docker Desktop (v4.0+)
- Docker Compose (v2.0+)

## Quick Reference

**Most Common Commands:**
```bash
# Start development environment
npm run docker:up:dev

# View development logs
npm run docker:logs:dev

# Stop development environment
npm run docker:down:dev

# Start production environment
npm run docker:up

# Check service status
npm run docker:status

# Access API container
npm run docker:shell:dev

# Access database
npm run docker:db:shell:dev

# Run migrations
npm run docker:migrate:dev

# Monitor with Datadog
npm run docker:datadog:logs:dev
```

## Quick Start

### Using npm Scripts (Recommended)

The project includes convenient npm scripts for Docker operations:

**Production Environment:**
```bash
# Start all services
npm run docker:up

# Check service status
npm run docker:status

# View API logs
npm run docker:logs

# Stop services
npm run docker:down
```

**Development Environment:**
```bash
# Start development environment
npm run docker:up:dev

# View live logs
npm run docker:logs:dev

# Stop development environment
npm run docker:down:dev
```

### Using Docker Compose Directly

**Production Environment:**

1. **Build and start all services:**
   ```bash
   docker-compose up -d
   ```

2. **Check service status:**
   ```bash
   docker-compose ps
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f api
   ```

4. **Stop services:**
   ```bash
   docker-compose down
   ```

**Development Environment:**

1. **Start development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **View live logs:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f api
   ```

3. **Stop development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

## Services

### API Service
- **Port:** 4000
- **Health Check:** `http://localhost:4000/health`
- **Environment:** Production (optimized build) or Development (with hot reload)

### Database Service
- **Port:** 5432
- **Database:** `tridmo_db` (production) or `tridmo_db_dev` (development)
- **User:** `postgres`
- **Password:** `postgres_password`

### Migration Service
- Runs database migrations automatically when starting the production environment
- Executes once and exits

### Datadog Agent Service
- **Monitoring:** Application Performance Monitoring (APM), logs, metrics, and traces
- **Agent Version:** 7.x
- **Environment:** Matches API environment (production/development)
- **Features:** Log collection, APM tracing, Docker monitoring, process monitoring

## Environment Configuration

### Required Environment Variables

Copy the `.env.sample` file to `.env` and configure the following variables:

```bash
# Database Configuration
DB_URL=postgresql://postgres:postgres_password@db:5432/tridmo_db
PG_HOST=db
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=postgres_password
PG_DB_NAME=tridmo_db

# Server Configuration
PORT=4000
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:3000

# JWT Configuration (CHANGE THESE IN PRODUCTION!)
ACCESS_TOKEN_SECRET=your_secure_access_token_secret
REFRESH_TOKEN_SECRET=your_secure_refresh_token_secret

# Email Configuration
EMAIL_USERNAME=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_HOSTNAME=smtp.gmail.com
EMAIL_FROM=noreply@yourdomain.com

# S3/Cloudflare R2 Configuration
S3_ACCOUNT_ID=your_account_id
S3_ACCESS_ID=your_access_key
S3_SECRET_KEY=your_secret_key
S3_IMAGES_BUCKET_NAME=your-images-bucket
S3_FILES_BUCKET_NAME=your-files-bucket
BASE_IMG_URL=https://your-domain.com/images
BASE_FILES_URL=https://your-domain.com/files

# Datadog Configuration
DD_API_KEY=your_datadog_api_key
DD_SITE=ap1.datadoghq.com
DD_ENV=production
```

## npm Scripts for Docker

The project includes comprehensive npm scripts for all Docker operations. These scripts provide a convenient wrapper around Docker and Docker Compose commands.

### Container Management

```bash
# Production Environment
npm run docker:up              # Start all services in production mode
npm run docker:down            # Stop all services
npm run docker:restart         # Restart API service
npm run docker:rebuild         # Rebuild and restart all services
npm run docker:status          # Check status of all services

# Development Environment  
npm run docker:up:dev          # Start all services in development mode
npm run docker:down:dev        # Stop development services
npm run docker:restart:dev     # Restart development API service
npm run docker:rebuild:dev     # Rebuild and restart development services
```

### Building Images

```bash
npm run docker:build           # Build production image
npm run docker:build:dev       # Build development image
```

### Logs and Monitoring

```bash
npm run docker:logs            # Follow API logs (production)
npm run docker:logs:dev        # Follow API logs (development)
npm run docker:logs:db         # Follow database logs
npm run docker:health          # Check API health endpoint
```

### Database Operations

```bash
# Production Database
npm run docker:migrate         # Run database migrations
npm run docker:seed            # Run database seeds
npm run docker:db:shell        # Access PostgreSQL shell
npm run docker:backup:db       # Backup database with timestamp

# Development Database
npm run docker:migrate:dev     # Run migrations (development)
npm run docker:seed:dev        # Run seeds (development)
npm run docker:db:shell:dev    # Access development PostgreSQL shell
```

### Container Access

```bash
npm run docker:shell           # Access API container shell (production)
npm run docker:shell:dev       # Access API container shell (development)
```

### Datadog Operations

```bash
npm run docker:datadog:logs        # Follow Datadog agent logs (production)
npm run docker:datadog:logs:dev    # Follow Datadog agent logs (development)
npm run docker:datadog:restart     # Restart Datadog agent (production)
npm run docker:datadog:restart:dev # Restart Datadog agent (development)
npm run docker:datadog:shell       # Access Datadog agent shell (production)
npm run docker:datadog:shell:dev   # Access Datadog agent shell (development)
```

### Maintenance

```bash
npm run docker:clean           # Clean up unused Docker resources
```

## Docker Commands

### Building Images

```bash
# Build production image
docker build -t tridmo-api:latest --target production .

# Build development image
docker build -t tridmo-api:dev --target development .
```

### Running Individual Containers

```bash
# Run database only
docker run -d \
  --name tridmo-db \
  -e POSTGRES_DB=tridmo_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres_password \
  -p 5432:5432 \
  postgres:15-alpine

# Run API (requires database)
docker run -d \
  --name tridmo-api \
  --env-file .env \
  -p 4000:4000 \
  tridmo-api:latest
```

### Database Operations

**Using npm scripts (recommended):**
```bash
# Production Database
npm run docker:migrate         # Run database migrations
npm run docker:seed            # Run database seeds
npm run docker:db:shell        # Access PostgreSQL shell
npm run docker:backup:db       # Backup database with timestamp

# Development Database
npm run docker:migrate:dev     # Run migrations (development)
npm run docker:seed:dev        # Run seeds (development)
npm run docker:db:shell:dev    # Access development PostgreSQL shell
```

**Using Docker Compose directly:**
```bash
# Run migrations
docker-compose exec api npm run migrate:latest

# Rollback migrations
docker-compose exec api npm run migrate:rollback

# Run seeds
docker-compose exec api npm run seed:run

# Access database shell
docker-compose exec db psql -U postgres -d tridmo_db
```

### Development Operations

**Using npm scripts (recommended):**
```bash
# Install new npm packages (development)
npm run docker:shell:dev
# Then inside container: npm install package-name

# Run tests (if available)
npm run docker:shell:dev
# Then inside container: npm test

# Access container shell
npm run docker:shell:dev
```

**Using Docker Compose directly:**
```bash
# Install new npm packages (development)
docker-compose -f docker-compose.dev.yml exec api npm install package-name

# Run tests (if available)
docker-compose -f docker-compose.dev.yml exec api npm test

# Access container shell
docker-compose -f docker-compose.dev.yml exec api sh
```

## Datadog Setup

### Prerequisites

1. **Datadog Account:** Sign up at [datadoghq.com](https://www.datadoghq.com)
2. **API Key:** Get your API key from Datadog dashboard

### Configuration

1. **Copy the Datadog environment template:**
   ```bash
   cp datadog.env.sample datadog.env
   ```

2. **Edit `datadog.env` with your credentials:**
   ```bash
   DD_API_KEY=your_actual_datadog_api_key
   DD_SITE=ap1.datadoghq.com  # or your region
   DD_ENV=prod
   ```

3. **Add Datadog variables to your environment:**
   You can either:
   - Add the variables to your main `.env` file
   - Use `--env-file datadog.env` with docker-compose
   - Set them as environment variables

### Features Enabled

- **APM (Application Performance Monitoring):** Traces API requests
- **Log Collection:** Collects logs from all containers
- **Infrastructure Monitoring:** Monitors Docker containers and host
- **Process Monitoring:** Tracks running processes
- **Custom Metrics:** StatsD integration for custom metrics

### Datadog Dashboard

Once running, you can view:
- **APM Traces:** Application → APM → Traces
- **Logs:** Logs → Log Explorer
- **Infrastructure:** Infrastructure → Containers
- **Metrics:** Metrics → Explorer

### Troubleshooting Datadog

```bash
# Check Datadog agent status
npm run docker:datadog:logs

# Verify agent is receiving data
npm run docker:datadog:shell
# Then inside container: agent status

# Check connectivity
docker-compose exec datadog agent check connectivity
```

## Volume Management

### Production Volumes
- `postgres_data`: PostgreSQL data persistence
- `uploads_data`: Application file uploads

### Development Volumes
- `postgres_dev_data`: Development database data
- `uploads_dev_data`: Development file uploads
- Source code is mounted for hot reloading

### Backup and Restore

```bash
# Backup database
docker-compose exec db pg_dump -U postgres tridmo_db > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres tridmo_db < backup.sql

# Backup volumes
docker run --rm -v tridmo-api_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   lsof -i :4000
   
   # Change port in docker-compose.yml
   ports:
     - "4001:4000"  # Use port 4001 instead
   ```

2. **Database connection issues:**
   ```bash
   # Check database logs
   docker-compose logs db
   
   # Restart database service
   docker-compose restart db
   ```

3. **Permission issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

4. **Out of disk space:**
   ```bash
   # Clean up Docker resources
   docker system prune -a
   
   # Remove unused volumes
   docker volume prune
   ```

### Health Checks

```bash
# Check API health
curl http://localhost:4000/health

# Check database health
docker-compose exec db pg_isready -U postgres

# View service health status
docker-compose ps
```

### Logs and Monitoring

```bash
# Follow all logs
docker-compose logs -f

# Follow specific service logs
docker-compose logs -f api
docker-compose logs -f db

# View last 100 lines
docker-compose logs --tail=100 api
```

## Production Deployment

### Security Considerations

1. **Change default passwords and secrets**
2. **Use environment files for sensitive data**
3. **Enable SSL/TLS termination**
4. **Configure proper CORS origins**
5. **Set up proper logging and monitoring**

### Scaling

```bash
# Scale API service
docker-compose up -d --scale api=3

# Use load balancer (nginx example)
# Add nginx service to docker-compose.yml
```

### Updates

```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build

# Zero-downtime deployment (with multiple replicas)
docker-compose up -d --scale api=2
docker-compose stop old_api_container
```

## Support

For additional help:
1. Check Docker logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose config`
3. Test database connectivity: `docker-compose exec db pg_isready -U postgres`
4. Review application health: `curl http://localhost:4000/health` 