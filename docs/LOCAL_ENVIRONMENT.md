# Local Environment Setup

This guide explains how to set up Autpost for local development using Docker.

## Quick Start with Docker

### Using Docker Compose (Recommended)

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

Visit http://localhost:8080

### Building Manually

```bash
# Build the image
docker build -t autpost .

# Run the container
docker run -d -p 8080:80 \
  -e APP_ENV=local \
  -e APP_DEBUG=true \
  autpost
```

## Docker Image Architecture

The Docker image is built using a multi-stage build:

1. **Stage 1 (frontend-builder):** Node.js Alpine image that builds the React frontend
2. **Stage 2 (backend):** PHP-FPM Alpine image with Nginx and Supervisor

The final image includes:

- PHP 8.3 with FPM
- Nginx web server
- Supervisor for process management
- Built frontend assets
- Laravel backend with all dependencies

## Environment Variables

| Variable           | Description                                    | Default                                  |
| ------------------ | ---------------------------------------------- | ---------------------------------------- |
| `APP_NAME`         | Application name                               | `Autpost`                                |
| `APP_ENV`          | Environment (`local`, `production`, `testing`) | `production`                             |
| `APP_DEBUG`        | Enable debug mode                              | `false`                                  |
| `APP_KEY`          | Laravel encryption key                         | Auto-generated if not set                |
| `APP_URL`          | Application URL                                | `http://localhost`                       |
| `LOG_CHANNEL`      | Log output channel                             | `stderr`                                 |
| `DB_CONNECTION`    | Database driver (`sqlite`, `mysql`, `pgsql`)   | `sqlite`                                 |
| `DB_HOST`          | Database host (for MySQL/PostgreSQL)           | `127.0.0.1`                              |
| `DB_PORT`          | Database port                                  | `3306` or `5432`                         |
| `DB_DATABASE`      | Database name/path                             | `/var/www/html/database/database.sqlite` |
| `DB_USERNAME`      | Database username                              | -                                        |
| `DB_PASSWORD`      | Database password                              | -                                        |
| `CACHE_STORE`      | Cache driver                                   | `file`                                   |
| `SESSION_DRIVER`   | Session driver                                 | `file`                                   |
| `QUEUE_CONNECTION` | Queue driver                                   | `sync`                                   |

## Volumes

The docker-compose.yml file defines two volumes:

- `app-data`: Persists the SQLite database
- `app-storage`: Persists Laravel storage (logs, cache, sessions)

## Using External Database

### PostgreSQL

```bash
docker run -d -p 8080:80 \
  -e APP_ENV=local \
  -e APP_DEBUG=true \
  -e DB_CONNECTION=pgsql \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_DATABASE=autpost \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=your-password \
  autpost
```

### MySQL

```bash
docker run -d -p 8080:80 \
  -e APP_ENV=local \
  -e APP_DEBUG=true \
  -e DB_CONNECTION=mysql \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=3306 \
  -e DB_DATABASE=autpost \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=your-password \
  autpost
```

## Native Development (Without Docker)

### Prerequisites

- PHP 8.2+ and Composer
- Node.js 18+ and pnpm
- PostgreSQL or SQLite

### Setup

1. **Backend:**

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --port=9527  # http://localhost:9527
```

2. **Frontend:**

```bash
pnpm install
pnpm run dev  # http://localhost:5173
```

### Using Makefile

```bash
make help      # Show all available commands
make install   # Install all dependencies
make dev       # Start both servers
make test      # Run tests
make lint      # Run linters
```

## Troubleshooting

### Container won't start

Check the logs:

```bash
docker logs container_name
```

### Permission issues

The container runs as `www-data`. If you're mounting volumes, ensure the directories have proper permissions:

```bash
chmod -R 755 /path/to/volume
chown -R 33:33 /path/to/volume  # www-data user
```

### Database connection issues

1. Ensure the database server is accessible from the container
2. Check that the environment variables are correctly set
3. For SQLite, ensure the database directory is writable

### Nginx errors

Check Nginx logs:

```bash
docker exec container_name cat /var/log/nginx/error.log
```

### Port conflicts

If port 8080 is in use, change the port mapping:

```bash
docker run -d -p 3000:80 autpost
```
