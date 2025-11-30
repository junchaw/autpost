# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Autpost is a full-stack application built with Laravel (backend) and React + Vite (frontend). The backend provides a REST API that the frontend consumes.

## Tech Stack

**Backend:**
- Laravel 12 (PHP 8.5)
- PostgreSQL (configured, currently using SQLite for development)
- Laravel Sanctum (API authentication)

**Frontend:**
- React 18 with TypeScript
- Vite (build tool and dev server)
- API client utility in `frontend/src/lib/api.ts`

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
└── frontend/         # React + Vite app
    ├── src/
    │   ├── lib/      # Utilities (API client)
    │   └── App.tsx   # Main component
    ├── .env          # Frontend environment variables
    └── vite.config.ts
```

## Development Commands

### Backend (Laravel)

**Start development server:**
```bash
cd backend
php artisan serve
# Runs on http://localhost:8000
```

**Database migrations:**
```bash
cd backend
php artisan migrate              # Run migrations
php artisan migrate:fresh        # Drop all tables and re-run migrations
php artisan migrate:rollback     # Rollback last migration
```

**Create new migration:**
```bash
cd backend
php artisan make:migration create_table_name
```

**Create new controller:**
```bash
cd backend
php artisan make:controller ControllerName
```

**Run tests:**
```bash
cd backend
php artisan test
```

**Code formatting (Laravel Pint):**
```bash
cd backend
./vendor/bin/pint
```

### Frontend (React + Vite)

**Start development server:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

**Build for production:**
```bash
cd frontend
npm run build
```

**Preview production build:**
```bash
cd frontend
npm run preview
```

**Type checking:**
```bash
cd frontend
npm run tsc
```

**Linting:**
```bash
cd frontend
npm run lint
```

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

- API client utility: `frontend/src/lib/api.ts`
- Base URL configured via `VITE_API_URL` environment variable
- All requests automatically include JSON headers
- Centralized error handling

**Usage example:**
```typescript
import { api } from './lib/api'

const data = await api.health()
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

Key variables in `frontend/.env`:
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
cd frontend
npm run dev
```

Then visit http://localhost:5173 to see the frontend, which will communicate with the backend API at http://localhost:8000.
