# Autpost

A full-stack application built with Laravel (backend API) and React + Vite (frontend).

## Tech Stack

- **Backend:** Laravel 12, PHP 8.5, PostgreSQL/SQLite, Laravel Sanctum
- **Frontend:** React 18, TypeScript, Vite

## Quick Start

### Prerequisites

- PHP 8.1+ and Composer
- Node.js 18+ and npm
- PostgreSQL (optional, using SQLite by default)

### Setup

1. **Backend:**
```bash
cd backend
composer install
cp .env.example .env  # If .env doesn't exist
php artisan key:generate
php artisan migrate
php artisan serve
```

2. **Frontend:**
```bash
cd frontend
npm install
npm run dev
```

3. Visit http://localhost:5173

## Development

See [CLAUDE.md](./CLAUDE.md) for detailed development instructions, architecture overview, and common commands.

## Project Structure

- `backend/` - Laravel REST API
- `frontend/` - React + Vite SPA
