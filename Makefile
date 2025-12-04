.PHONY: help install dev build test clean lint format
.DEFAULT_GOAL := help

##@ General

help: ## Display this help message
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Installation

install: ## Install all dependencies (backend + frontend)
	@echo "Installing backend dependencies..."
	cd backend && composer install
	@echo "Installing frontend dependencies..."
	cd frontend && pnpm install
	@echo "✓ All dependencies installed"

install-backend: ## Install backend dependencies only
	cd backend && composer install

install-frontend: ## Install frontend dependencies only
	cd frontend && pnpm install

##@ Development

dev: ## Start both backend and frontend development servers
	@echo "Starting development servers..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:5173"
	@make -j2 dev-backend dev-frontend

dev-backend: ## Start backend development server
	cd backend && php artisan serve

dev-frontend: ## Start frontend development server
	cd frontend && pnpm run dev

##@ Build

build: ## Build frontend for production
	cd frontend && pnpm run build

build-preview: ## Preview production build
	cd frontend && pnpm run preview

##@ Testing

test: ## Run backend tests
	cd backend && php artisan test

test-backend: ## Run backend tests
	cd backend && php artisan test

##@ Database

db-migrate: ## Run database migrations
	cd backend && php artisan migrate

db-fresh: ## Drop all tables and re-run migrations
	cd backend && php artisan migrate:fresh

db-seed: ## Seed the database
	cd backend && php artisan db:seed

db-reset: ## Reset database (fresh + seed)
	cd backend && php artisan migrate:fresh --seed

##@ Code Quality

lint: ## Run linters (backend + frontend)
	@echo "Linting backend..."
	cd backend && ./vendor/bin/pint --test
	@echo "Linting frontend..."
	cd frontend && pnpm run lint

lint-backend: ## Run backend linter (Pint)
	cd backend && ./vendor/bin/pint --test

lint-frontend: ## Run frontend linter (ESLint)
	cd frontend && pnpm run lint

format: ## Format code (backend + frontend)
	@echo "Formatting backend..."
	cd backend && ./vendor/bin/pint
	@echo "Formatting frontend..."
	cd frontend && pnpm run lint

format-backend: ## Format backend code (Pint)
	cd backend && ./vendor/bin/pint

typecheck: ## Run TypeScript type checking
	cd frontend && pnpm run tsc

##@ Cleanup

clean: ## Clean build artifacts and caches
	@echo "Cleaning build artifacts..."
	rm -rf frontend/dist
	rm -rf frontend/node_modules/.vite
	rm -rf backend/bootstrap/cache/*.php
	@echo "✓ Cleaned"

clean-all: ## Remove all dependencies and build artifacts
	@echo "Removing all dependencies and build artifacts..."
	rm -rf frontend/dist
	rm -rf frontend/node_modules
	rm -rf backend/vendor
	rm -rf backend/bootstrap/cache/*.php
	@echo "✓ All cleaned"

##@ Laravel Artisan

artisan-key: ## Generate application key
	cd backend && php artisan key:generate

artisan-cache: ## Clear all caches
	cd backend && php artisan cache:clear
	cd backend && php artisan config:clear
	cd backend && php artisan route:clear
	cd backend && php artisan view:clear

artisan-optimize: ## Optimize the application
	cd backend && php artisan optimize

##@ Setup

setup: install artisan-key db-migrate ## Initial project setup
	@echo "✓ Project setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Configure backend/.env (database, etc.)"
	@echo "  2. Configure frontend/.env (API URL)"
	@echo "  3. Run 'make dev' to start development servers"

##@ Information

status: ## Show project status
	@echo "\n\033[1mProject Status\033[0m"
	@echo "=============="
	@echo "\n\033[1mBackend:\033[0m"
	@cd backend && php --version | head -n 1
	@cd backend && composer --version
	@echo "\n\033[1mFrontend:\033[0m"
	@cd frontend && node --version
	@cd frontend && pnpm --version
	@echo ""
