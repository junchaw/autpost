# Autpost

A full-stack application built with Laravel (backend API) and React + Vite (frontend).

## Tech Stack

| Layer        | Technologies                                            |
| ------------ | ------------------------------------------------------- |
| **Backend**  | Laravel 12, PHP 8.4, PostgreSQL/SQLite, Laravel Sanctum |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, DaisyUI       |

## Quick Start

```bash
# Using Docker (recommended)
docker-compose up -d
```

Visit http://localhost:8080

For local development setup, see [Local Environment](./docs/LOCAL_ENVIRONMENT.md).

## Project Structure

```
autpost/
├── backend/           # Laravel REST API
├── src/               # React + Vite SPA
├── docs/              # Documentation
├── docker/            # Docker configuration
```

## Documentation

| Document                                         | Description                     |
| ------------------------------------------------ | ------------------------------- |
| [Local Environment](./docs/LOCAL_ENVIRONMENT.md) | Local development setup         |
| [Deployment](./docs/DEPLOYMENT.md)               | Production deployment and CI/CD |
| [Development Guide](./docs/DEVELOPMENT_GUIDE.md) | API patterns and conventions    |
| [Dependencies](./docs/DEPENDENCIES.md)           | PHP and JS dependencies         |
