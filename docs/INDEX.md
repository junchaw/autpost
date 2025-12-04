# Documentation Index

Welcome to the Autpost documentation. This index provides quick access to all documentation resources.

## Project Documentation

- [Dependencies](./DEPENDENCIES.md) - PHP and JavaScript dependencies with links
- [Main Project Guide](../CLAUDE.md) - Setup guide and architecture overview

## Quick Links

### Backend Technologies

- [Laravel](https://laravel.com) - PHP web framework
- [Laravel Sanctum](https://laravel.com/docs/sanctum) - API authentication
- [PHPUnit](https://phpunit.de) - PHP testing framework
- [Laravel Pint](https://laravel.com/docs/pint) - Code style fixer

### Frontend Technologies

- [React](https://react.dev) - UI framework
- [TypeScript](https://www.typescriptlang.org) - Type-safe JavaScript
- [Vite](https://vite.dev) - Build tool and dev server
- [pnpm](https://pnpm.io) - Package manager

### Styling & UI Libraries

- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [DaisyUI](https://daisyui.com) - Tailwind CSS component library
- [shadcn/ui](https://ui.shadcn.com) - Re-usable component library
- [Radix UI](https://www.radix-ui.com) - Unstyled accessible UI primitives
- [Lucide Icons](https://lucide.dev) - Icon library

## Common Commands

### Using Makefile (Recommended)

```bash
make help             # Show all available commands
make install          # Install all dependencies
make dev              # Start both servers
make build            # Build frontend for production
make test             # Run backend tests
make lint             # Run all linters
make format           # Format all code
make clean            # Clean build artifacts
make setup            # Initial project setup
```

### Frontend (pnpm)

```bash
pnpm install          # Install dependencies
pnpm run dev          # Start dev server
pnpm run build        # Build for production
pnpm run lint         # Run ESLint
```

### Backend (composer)

```bash
cd backend
composer install      # Install dependencies
php artisan serve     # Start dev server
php artisan test      # Run tests
./vendor/bin/pint     # Format code
```

## Detailed Package Lists

For complete lists of all PHP and JavaScript dependencies with links to their documentation, see [DEPENDENCIES.md](./DEPENDENCIES.md).

## Additional Resources

- [pnpm Documentation](https://pnpm.io) - Package manager documentation
- [React DevTools](https://react.dev/learn/react-developer-tools) - Browser extension for debugging
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) - VS Code extension
- [ES7+ React Snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets) - VS Code snippets
