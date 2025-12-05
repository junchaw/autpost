.PHONY: help
.DEFAULT_GOAL := help

##@ General

help: ## Display this help message
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Installation

.PHONY: install
install: install-backend install-frontend ## Install all dependencies (backend + frontend)
	@echo "✓ All dependencies installed"

.PHONY: install-backend
install-backend: ## Install backend dependencies only
	cd backend && composer install

.PHONY: install-frontend
install-frontend: ## Install frontend dependencies only
	pnpm install

##@ Development

gen: gen-openapi ## Generate OpenAPI spec and TypeScript client

gen-openapi: ## Generate OpenAPI spec and TypeScript client
	cd backend && php artisan l5-swagger:generate
	rm -f openapi/openapi.json
	cp openapi/openapi.yaml public/openapi.yaml
	npx openapi-typescript openapi/openapi.yaml -o src/lib/api/generated/schema.d.ts

.PHONY: dev
dev: ## Start both backend and frontend development servers
	@echo "Starting development servers..."
	@echo "Backend: http://localhost:9527"
	@echo "Frontend: http://localhost:5173"
	@make -j2 dev-backend dev-frontend

.PHONY: dev-backend
dev-backend: ## Start backend development server
	cd backend && php artisan serve --port=9527

.PHONY: dev-frontend
dev-frontend: ## Start frontend development server
	pnpm run dev

##@ Build

.PHONY: build
build: ## Build frontend for production
	pnpm run build

.PHONY: build-preview
build-preview: ## Preview production build
	pnpm run preview

##@ Testing

.PHONY: test
test: test-backend ## Run backend tests

.PHONY: test-backend
test-backend: ## Run backend tests
	cd backend && php artisan test

##@ Database

.PHONY: db-migrate
db-migrate: ## Run database migrations
	cd backend && php artisan migrate
.PHONY: db-fresh

.PHONY: db-fresh
db-fresh: ## Drop all tables and re-run migrations
	cd backend && php artisan migrate:fresh
.PHONY: db-seed

.PHONY: db-seed
db-seed: ## Seed the database
	cd backend && php artisan db:seed
.PHONY: db-reset

.PHONY: db-reset
db-reset: ## Reset database (fresh + seed)
	cd backend && php artisan migrate:fresh --seed

##@ Code Quality

.PHONY: lint
lint: typecheck lint-backend lint-frontend## Run linters (backend + frontend)

.PHONY: lint-backend
lint-backend: ## Run backend linter (Pint)
	cd backend && ./vendor/bin/pint --test

.PHONY: lint-frontend
lint-frontend: ## Run frontend linter (ESLint)
	pnpm run lint

.PHONY: lint-frontend-fix
lint-frontend-fix: ## Run frontend linter with auto-fix (ESLint)
	pnpm run lint:fix

.PHONY: format
format: ## Format code (backend + frontend)
	$(MAKE) format-backend
	$(MAKE) format-frontend

.PHONY: format-backend
format-backend: ## Format backend code (Pint)
	cd backend && ./vendor/bin/pint

.PHONY: format-frontend
format-frontend: ## Format frontend code (Prettier)
	pnpm run format

.PHONY: typecheck
typecheck: ## Run TypeScript type checking
	pnpm run tsc

##@ Cleanup

.PHONY: clean
clean: ## Clean build artifacts and caches
	@echo "Cleaning build artifacts..."
	rm -rf dist
	rm -rf node_modules/.vite
	rm -rf backend/bootstrap/cache/*.php
	@echo "✓ Cleaned"
.PHONY: clean-all

##@ Laravel Artisan

.PHONY: artisan-key
artisan-key: ## Generate application key
	cd backend && php artisan key:generate

.PHONY: artisan-cache
artisan-cache: ## Clear all caches
	cd backend && php artisan cache:clear
	cd backend && php artisan config:clear
	cd backend && php artisan route:clear
	cd backend && php artisan view:clear

.PHONY: artisan-optimize
artisan-optimize: ## Optimize the application
	cd backend && php artisan optimize

##@ Setup

.PHONY: setup
setup: install artisan-key db-migrate ## Initial project setup
	@echo "✓ Project setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Configure backend/.env (database, etc.)"
	@echo "  2. Configure frontend/.env (API URL)"
	@echo "  3. Run 'make dev' to start development servers"

##@ Docker

docker-build: ## Build Docker image
	docker build -t autpost .

docker-run: ## Run Docker container
	docker-compose up -d

docker-stop: ## Stop Docker container
	docker-compose down

docker-destroy: ## Destroy Docker environment including volumes
	docker-compose down -v --rmi local

docker-logs: ## View Docker logs
	docker-compose logs -f

docker-shell: ## Open shell in Docker container
	docker-compose exec app sh

##@ Information

.PHONY: status
status: ## Show project status
	@echo "\n\033[1mProject Status\033[0m"
	@echo "=============="
	@echo "\n\033[1mBackend:\033[0m"
	@cd backend && php --version | head -n 1
	@cd backend && composer --version
	@echo "\n\033[1mFrontend:\033[0m"
	@node --version
	@pnpm --version
	@echo ""
