# Development Guidelines

This document outlines the development patterns and conventions used in this project.

## Soft Delete

All resources in this application implement **soft delete**. This means:

- Records are not permanently removed from the database when deleted
- A `deleted_at` timestamp column is set instead
- Soft-deleted records can be restored
- Use `forceDelete` for permanent deletion when necessary

### Laravel Implementation

Models use the `SoftDeletes` trait:

```php
use Illuminate\Database\Eloquent\SoftDeletes;

class Todo extends Model
{
    use SoftDeletes;
}
```

Migrations include the `softDeletes()` column:

```php
Schema::create('todos', function (Blueprint $table) {
    // ... other columns
    $table->timestamps();
    $table->softDeletes();
});
```

## API Structure

### Standard CRUD Endpoints

Each resource should implement the following API endpoints:

| Method | Endpoint                       | Description                 |
| ------ | ------------------------------ | --------------------------- |
| GET    | `/api/{resource}`              | List with pagination        |
| POST   | `/api/{resource}`              | Create new record           |
| GET    | `/api/{resource}/{id}`         | Get single record           |
| PUT    | `/api/{resource}/{id}`         | Update record               |
| DELETE | `/api/{resource}/{id}`         | Soft delete record          |
| POST   | `/api/{resource}/{id}/restore` | Restore soft-deleted record |
| DELETE | `/api/{resource}/{id}/force`   | Permanently delete record   |

### Pagination Response Format

List endpoints return paginated results with the following structure:

```json
{
  "items": [...],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total": 100
  }
}
```

Query parameters for pagination:

- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20, max: 100)

### Controller Template

```php
class ResourceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // List with pagination
    }

    public function show(int $id): JsonResponse
    {
        // Get single record
    }

    public function store(Request $request): JsonResponse
    {
        // Create new record
    }

    public function update(Request $request, int $id): JsonResponse
    {
        // Update record
    }

    public function destroy(int $id): JsonResponse
    {
        // Soft delete
    }

    public function restore(int $id): JsonResponse
    {
        // Restore soft-deleted record
    }

    public function forceDelete(int $id): JsonResponse
    {
        // Permanently delete record
    }
}
```

### Route Registration

```php
Route::prefix('resource')->group(function () {
    Route::get('/', [ResourceController::class, 'index']);
    Route::post('/', [ResourceController::class, 'store']);
    Route::get('/{id}', [ResourceController::class, 'show']);
    Route::put('/{id}', [ResourceController::class, 'update']);
    Route::delete('/{id}', [ResourceController::class, 'destroy']);
    Route::post('/{id}/restore', [ResourceController::class, 'restore']);
    Route::delete('/{id}/force', [ResourceController::class, 'forceDelete']);
});
```

## Frontend API Client

The frontend API is split by resource in `src/lib/api/`:

```
src/lib/api/
├── index.ts           # Main entry point, exports all
├── client.ts          # fetchApi helper and health check
├── types.ts           # Shared types (Pagination)
├── config.ts          # Dashboard config API
├── todos.ts           # Todo API
├── recurring-todos.ts # Recurring todo API
└── notes.ts           # Note API
```

### Adding a New Resource

1. Create a new file `src/lib/api/{resource}.ts`
2. Define types and API methods
3. Export from `src/lib/api/index.ts`
4. Add to the `api` object for backward compatibility

### Example Resource API File

```typescript
import { fetchApi } from './client';
import type { Pagination } from './types';

export interface Resource {
  id: number;
  user_id: number;
  // ... fields
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateResourceInput {
  user_id: number;
  // ... fields
}

export interface UpdateResourceInput {
  // ... optional fields
}

export interface ResourceListParams {
  userId: number;
  page?: number;
  perPage?: number;
}

export const resourceApi = {
  list: (params: ResourceListParams) => {
    const searchParams = new URLSearchParams();
    searchParams.set('user_id', params.userId.toString());
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.perPage) searchParams.set('per_page', params.perPage.toString());
    return fetchApi<{ resources: Resource[]; pagination: Pagination }>(
      `/resources?${searchParams.toString()}`
    );
  },

  get: (id: number) => fetchApi<{ resource: Resource }>(`/resources/${id}`),

  create: (data: CreateResourceInput) =>
    fetchApi<{ message: string; resource: Resource }>('/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateResourceInput) =>
    fetchApi<{ message: string; resource: Resource }>(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<{ message: string }>(`/resources/${id}`, {
      method: 'DELETE',
    }),

  restore: (id: number) =>
    fetchApi<{ message: string; resource: Resource }>(`/resources/${id}/restore`, {
      method: 'POST',
    }),
};
```

## Database Seeders

Each resource should have a seeder for development data:

```bash
# Run all seeders
php artisan db:seed

# Reset database and seed
php artisan migrate:fresh --seed

# Run specific seeder
php artisan db:seed --class=NoteSeeder
```

Seeders are registered in `DatabaseSeeder.php`:

```php
$this->call([
    RecurringTodoSeeder::class,
    TodoSeeder::class,
    NoteSeeder::class,
]);
```
