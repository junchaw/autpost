# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Autpost is a full-stack application built with Laravel (backend) and React + Vite (frontend). The backend provides a REST API that the frontend consumes.

## Tech Stack

**Backend:** Laravel 12 (PHP 8.4), PostgreSQL/SQLite, Laravel Sanctum

**Frontend:** React 18, TypeScript, Vite, pnpm, Tailwind CSS v4, shadcn/ui, DaisyUI

**UI/Styling:** Hybrid approach using shadcn/ui for basic components and DaisyUI for styled components

For complete technology documentation and package details, see **[docs/INDEX.md](docs/INDEX.md)** and **[docs/DEPENDENCIES.md](docs/DEPENDENCIES.md)**

## Repository Structure

```
autpost/
├── backend/           # Laravel API
│   ├── app/          # Application code
│   ├── routes/       # API and web routes
│   │   ├── api.php   # API routes (prefixed with /api)
│   │   └── web.php   # Web routes
│   ├── database/     # Migrations and seeders
│   ├── config/       # Configuration files
│   └── .env          # Environment configuration
├── src/              # React + Vite app (root level)
│   ├── lib/          # Utilities (API client)
│   └── App.tsx       # Main component
├── .env              # Frontend environment variables
└── vite.config.ts    # Vite configuration
```

## Quick Start

### Using Makefile (Recommended)

```bash
make help      # Show all available commands
make install   # Install all dependencies
make dev       # Start both servers
```

### Manual Setup

**Backend:**

```bash
cd backend
composer install
php artisan serve  # http://localhost:8000
```

**Frontend:**

```bash
pnpm install
pnpm run dev  # http://localhost:5173
```

For complete command reference, see **[docs/INDEX.md](docs/INDEX.md)** or run `make help`

## Architecture

### Backend API

- **API routes** are defined in `backend/routes/api.php`
- All API routes are automatically prefixed with `/api`
- CORS is configured to allow requests from `http://localhost:5173` (frontend dev server)
- Authentication uses Laravel Sanctum (token-based)

**Example API endpoint:**

- Health check: `GET /api/health`
- Returns: `{"status": "ok", "timestamp": "..."}`

### Frontend API Client

- API client utility: `src/lib/api.ts`
- Base URL configured via `VITE_API_URL` environment variable
- All requests automatically include JSON headers
- Centralized error handling

**Usage example:**

```typescript
import { api } from './lib/api';

const data = await api.health();
```

## Database

**Currently using:** SQLite (for development)

**PostgreSQL setup (recommended for production):**

1. Install PostgreSQL:

```bash
brew install postgresql
brew services start postgresql
```

2. Create database:

```bash
createdb autpost
```

3. Update `backend/.env`:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=autpost
DB_USERNAME=postgres
DB_PASSWORD=
```

4. Run migrations:

```bash
cd backend
php artisan migrate
```

## Environment Configuration

### Backend (.env)

Key variables in `backend/.env`:

- `APP_URL=http://localhost:8000` - Backend URL
- `DB_CONNECTION=sqlite` - Database driver
- `FRONTEND_URL=http://localhost:5173` - Frontend URL for CORS

### Frontend (.env)

Key variables in `.env` (root level):

- `VITE_API_URL=http://localhost:8000` - Backend API URL

## Running Both Servers

Open two terminal windows:

**Terminal 1 (Backend):**

```bash
cd backend
php artisan serve
```

**Terminal 2 (Frontend):**

```bash
pnpm run dev
```

Then visit http://localhost:5173 to see the frontend, which will communicate with the backend API at http://localhost:8000.

## Documentation

For comprehensive documentation, commands, and package references:

- **[docs/INDEX.md](docs/INDEX.md)** - Main documentation hub with quick links, commands, and technology references
- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Development guidelines, API patterns, and conventions
- **[docs/DEPENDENCIES.md](docs/DEPENDENCIES.md)** - Complete list of all PHP and JavaScript dependencies with links

## Important: Read Before Making Changes

**Before adding new features or modifying existing code, read [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** to understand:

- Soft delete implementation patterns
- Standard CRUD API structure (list, create, get, update, delete, restore, hard delete)
- Pagination response format
- Frontend API client organization

## Important: Update Dependencies Documentation

**When adding new dependencies**, update [docs/DEPENDENCIES.md](docs/DEPENDENCIES.md) with:

- Package name and version
- Link to documentation
- Brief description of what it's used for

This applies to both:

- PHP packages (via `composer require`)
- JavaScript packages (via `pnpm add`)
