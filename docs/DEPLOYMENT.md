# Deployment Guide

This guide covers deploying Autpost to production environments.

## Docker Deployment

### Pull from GitHub Container Registry

```bash
docker pull ghcr.io/YOUR_USERNAME/autpost:latest
```

### Run the Container

```bash
docker run -d -p 80:80 \
  --name autpost \
  -e APP_ENV=production \
  -e APP_DEBUG=false \
  -e APP_KEY=base64:your-generated-key \
  -e APP_URL=https://your-domain.com \
  -e DB_CONNECTION=pgsql \
  -e DB_HOST=your-db-host \
  -e DB_PORT=5432 \
  -e DB_DATABASE=autpost \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=your-secure-password \
  ghcr.io/YOUR_USERNAME/autpost:latest
```

### Generate APP_KEY

```bash
# Generate a new Laravel app key
docker run --rm ghcr.io/YOUR_USERNAME/autpost:latest php artisan key:generate --show
```

## CI/CD with GitHub Actions

The project includes a GitHub Actions workflow (`.github/workflows/release.yml`) that:

1. Builds the Docker image on every push to `main` and on version tags
2. Pushes to GitHub Container Registry (ghcr.io)
3. Tests the image on pull requests

### Creating a Release

```bash
git tag v1.0.0
git push origin v1.0.0
```

This will create Docker images with tags:

- `v1.0.0`
- `1.0`
- `1`
- `latest` (for main branch only)

### Pulling Specific Versions

```bash
# Latest version
docker pull ghcr.io/YOUR_USERNAME/autpost:latest

# Specific version
docker pull ghcr.io/YOUR_USERNAME/autpost:v1.0.0

# Major version (latest 1.x)
docker pull ghcr.io/YOUR_USERNAME/autpost:1
```

## Database Configuration

### PostgreSQL (Recommended)

```bash
docker run -d -p 80:80 \
  -e DB_CONNECTION=pgsql \
  -e DB_HOST=your-postgres-host \
  -e DB_PORT=5432 \
  -e DB_DATABASE=autpost \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=your-password \
  ghcr.io/YOUR_USERNAME/autpost:latest
```

### MySQL

```bash
docker run -d -p 80:80 \
  -e DB_CONNECTION=mysql \
  -e DB_HOST=your-mysql-host \
  -e DB_PORT=3306 \
  -e DB_DATABASE=autpost \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=your-password \
  ghcr.io/YOUR_USERNAME/autpost:latest
```

### SQLite (Not recommended for production)

```bash
docker run -d -p 80:80 \
  -e DB_CONNECTION=sqlite \
  -v autpost-data:/var/www/html/database \
  ghcr.io/YOUR_USERNAME/autpost:latest
```

## Environment Variables Reference

| Variable           | Description            | Default            | Required             |
| ------------------ | ---------------------- | ------------------ | -------------------- |
| `APP_ENV`          | Environment mode       | `production`       | No                   |
| `APP_DEBUG`        | Enable debug mode      | `false`            | No                   |
| `APP_KEY`          | Laravel encryption key | Auto-generated     | Yes\*                |
| `APP_URL`          | Application URL        | `http://localhost` | Yes                  |
| `LOG_CHANNEL`      | Log output channel     | `stderr`           | No                   |
| `DB_CONNECTION`    | Database driver        | `sqlite`           | No                   |
| `DB_HOST`          | Database host          | `127.0.0.1`        | For MySQL/PostgreSQL |
| `DB_PORT`          | Database port          | Driver default     | For MySQL/PostgreSQL |
| `DB_DATABASE`      | Database name/path     | SQLite path        | Yes                  |
| `DB_USERNAME`      | Database username      | -                  | For MySQL/PostgreSQL |
| `DB_PASSWORD`      | Database password      | -                  | For MySQL/PostgreSQL |
| `CACHE_STORE`      | Cache driver           | `file`             | No                   |
| `SESSION_DRIVER`   | Session driver         | `file`             | No                   |
| `QUEUE_CONNECTION` | Queue driver           | `sync`             | No                   |

\*APP_KEY is auto-generated if not provided, but should be set explicitly for production.

## Health Check

The container includes a health check endpoint at `/api/health`.

```bash
# Check container health status
docker inspect --format='{{.State.Health.Status}}' autpost

# Manual health check
curl http://your-domain.com/api/health
```

## Reverse Proxy Setup

### Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Traefik (docker-compose)

```yaml
version: '3.8'

services:
  autpost:
    image: ghcr.io/YOUR_USERNAME/autpost:latest
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.autpost.rule=Host(`your-domain.com`)'
      - 'traefik.http.routers.autpost.entrypoints=websecure'
      - 'traefik.http.routers.autpost.tls.certresolver=letsencrypt'
    environment:
      - APP_ENV=production
      - APP_URL=https://your-domain.com
      # ... other env vars

  traefik:
    image: traefik:v2.10
    command:
      - '--providers.docker=true'
      - '--entrypoints.websecure.address=:443'
      - '--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web'
      - '--certificatesresolvers.letsencrypt.acme.email=your@email.com'
      - '--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json'
    ports:
      - '443:443'
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt:/letsencrypt

volumes:
  letsencrypt:
```

### Caddy

```
your-domain.com {
    reverse_proxy localhost:8080
}
```

## Production Recommendations

### Security

1. **Never enable APP_DEBUG in production** - exposes sensitive information
2. **Use strong APP_KEY** - generate with `php artisan key:generate`
3. **Use HTTPS** - configure SSL/TLS with a reverse proxy
4. **Secure database credentials** - use secrets management
5. **Keep images updated** - regularly pull latest security patches

### Performance

1. **Use a managed database** - PostgreSQL or MySQL for reliability
2. **Enable Redis caching** - set `CACHE_STORE=redis` and `SESSION_DRIVER=redis`
3. **Use CDN** - for static assets in high-traffic scenarios
4. **Scale horizontally** - run multiple containers behind a load balancer

### Monitoring

1. **Health checks** - monitor `/api/health` endpoint
2. **Logging** - forward `stderr` logs to centralized logging (ELK, CloudWatch, etc.)
3. **Metrics** - integrate with Prometheus/Grafana for performance monitoring
4. **Alerts** - set up alerts for container health, error rates, response times

### Backup

1. **Database backups** - configure automated backups for your database
2. **Volume backups** - if using SQLite, backup the data volume regularly

## Troubleshooting

### Container won't start

```bash
docker logs autpost
```

### Permission issues

```bash
docker exec autpost chown -R www-data:www-data /var/www/html/storage
```

### Database migrations

```bash
docker exec autpost php artisan migrate --force
```

### Clear caches

```bash
docker exec autpost php artisan cache:clear
docker exec autpost php artisan config:clear
docker exec autpost php artisan route:clear
docker exec autpost php artisan view:clear
```
