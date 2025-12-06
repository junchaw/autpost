<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RecurringTodo;
use App\Services\RecurringTodoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'RecurringTodos', description: 'Recurring todo management endpoints')]
class RecurringTodoController extends Controller
{
    #[OA\Get(
        path: '/recurring-todos',
        summary: 'Get all recurring todos for the authenticated user',
        security: [['bearerAuth' => []]],
        tags: ['RecurringTodos'],
        parameters: [
            new OA\Parameter(name: 'state', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['active', 'paused'])),
            new OA\Parameter(name: 'include_deleted', in: 'query', required: false, schema: new OA\Schema(type: 'boolean')),
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'List of recurring todos with pagination'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'state' => 'nullable|in:active,paused',
            'include_deleted' => 'nullable|boolean',
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
        ]);

        $query = RecurringTodo::where('user_id', $request->user()->id);

        if ($request->has('state')) {
            $query->where('state', $request->input('state'));
        }

        if ($request->boolean('include_deleted')) {
            $query->withTrashed();
        }

        $perPage = $request->input('per_page', 10);

        $recurringTodos = $query->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'recurring_todos' => $recurringTodos->items(),
            'pagination' => [
                'current_page' => $recurringTodos->currentPage(),
                'per_page' => $recurringTodos->perPage(),
                'total' => $recurringTodos->total(),
            ],
        ]);
    }

    #[OA\Get(
        path: '/recurring-todos/{id}',
        summary: 'Get a single recurring todo',
        security: [['bearerAuth' => []]],
        tags: ['RecurringTodos'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Recurring todo details'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Recurring todo not found'),
        ]
    )]
    public function show(Request $request, int $id): JsonResponse
    {
        $recurringTodo = RecurringTodo::withTrashed()
            ->with('todos')
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'recurring_todo' => $recurringTodo,
        ]);
    }

    #[OA\Post(
        path: '/recurring-todos',
        summary: 'Create a new recurring todo',
        security: [['bearerAuth' => []]],
        tags: ['RecurringTodos'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['title', 'interval', 'interval_unit', 'start_time'],
                properties: [
                    new OA\Property(property: 'title', type: 'string', maxLength: 255),
                    new OA\Property(property: 'note', type: 'string', nullable: true),
                    new OA\Property(property: 'interval', type: 'integer', minimum: 1),
                    new OA\Property(property: 'interval_unit', type: 'string', enum: ['minute', 'hour', 'day', 'week', 'month', 'year']),
                    new OA\Property(property: 'start_time', type: 'string', format: 'date-time'),
                    new OA\Property(property: 'end_time', type: 'string', format: 'date-time', nullable: true),
                    new OA\Property(property: 'state', type: 'string', enum: ['active', 'paused'], nullable: true),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Recurring todo created successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'note' => 'nullable|string',
            'interval' => 'required|integer|min:1',
            'interval_unit' => 'required|in:minute,hour,day,week,month,year',
            'start_time' => 'required|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'state' => 'nullable|in:active,paused',
        ]);

        $validated['user_id'] = $request->user()->id;
        $recurringTodo = RecurringTodo::create($validated);

        return response()->json([
            'message' => 'Recurring todo created successfully',
            'recurring_todo' => $recurringTodo,
        ], 201);
    }

    #[OA\Put(
        path: '/recurring-todos/{id}',
        summary: 'Update a recurring todo',
        security: [['bearerAuth' => []]],
        tags: ['RecurringTodos'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'title', type: 'string', maxLength: 255),
                    new OA\Property(property: 'note', type: 'string', nullable: true),
                    new OA\Property(property: 'interval', type: 'integer', minimum: 1),
                    new OA\Property(property: 'interval_unit', type: 'string', enum: ['minute', 'hour', 'day', 'week', 'month', 'year']),
                    new OA\Property(property: 'start_time', type: 'string', format: 'date-time'),
                    new OA\Property(property: 'end_time', type: 'string', format: 'date-time', nullable: true),
                    new OA\Property(property: 'state', type: 'string', enum: ['active', 'paused'], nullable: true),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Recurring todo updated successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Recurring todo not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(Request $request, int $id): JsonResponse
    {
        $recurringTodo = RecurringTodo::where('user_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'note' => 'nullable|string',
            'interval' => 'sometimes|integer|min:1',
            'interval_unit' => 'sometimes|in:minute,hour,day,week,month,year',
            'start_time' => 'sometimes|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'state' => 'nullable|in:active,paused',
        ]);

        $recurringTodo->update($validated);

        return response()->json([
            'message' => 'Recurring todo updated successfully',
            'recurring_todo' => $recurringTodo,
        ]);
    }

    #[OA\Delete(
        path: '/recurring-todos/{id}',
        summary: 'Soft delete a recurring todo',
        security: [['bearerAuth' => []]],
        tags: ['RecurringTodos'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Recurring todo deleted successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Recurring todo not found'),
        ]
    )]
    public function destroy(Request $request, int $id): JsonResponse
    {
        $recurringTodo = RecurringTodo::where('user_id', $request->user()->id)->findOrFail($id);
        $recurringTodo->delete();

        return response()->json([
            'message' => 'Recurring todo deleted successfully',
        ]);
    }

    #[OA\Post(
        path: '/recurring-todos/{id}/restore',
        summary: 'Restore a soft-deleted recurring todo',
        security: [['bearerAuth' => []]],
        tags: ['RecurringTodos'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Recurring todo restored successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Recurring todo not found'),
        ]
    )]
    public function restore(Request $request, int $id): JsonResponse
    {
        $recurringTodo = RecurringTodo::withTrashed()
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);
        $recurringTodo->restore();

        return response()->json([
            'message' => 'Recurring todo restored successfully',
            'recurring_todo' => $recurringTodo,
        ]);
    }

    #[OA\Delete(
        path: '/recurring-todos/{id}/force',
        summary: 'Permanently delete a recurring todo',
        security: [['bearerAuth' => []]],
        tags: ['RecurringTodos'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Recurring todo permanently deleted'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Recurring todo not found'),
        ]
    )]
    public function forceDelete(Request $request, int $id): JsonResponse
    {
        $recurringTodo = RecurringTodo::withTrashed()
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);
        $recurringTodo->forceDelete();

        return response()->json([
            'message' => 'Recurring todo permanently deleted',
        ]);
    }

    #[OA\Post(
        path: '/recurring-todos/{id}/pause',
        summary: 'Pause a recurring todo',
        security: [['bearerAuth' => []]],
        tags: ['RecurringTodos'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Recurring todo paused'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Recurring todo not found'),
        ]
    )]
    public function pause(Request $request, int $id): JsonResponse
    {
        $recurringTodo = RecurringTodo::where('user_id', $request->user()->id)->findOrFail($id);
        $recurringTodo->update(['state' => 'paused']);

        return response()->json([
            'message' => 'Recurring todo paused',
            'recurring_todo' => $recurringTodo,
        ]);
    }

    #[OA\Post(
        path: '/recurring-todos/{id}/resume',
        summary: 'Resume a recurring todo',
        security: [['bearerAuth' => []]],
        tags: ['RecurringTodos'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Recurring todo resumed'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Recurring todo not found'),
        ]
    )]
    public function resume(Request $request, int $id): JsonResponse
    {
        $recurringTodo = RecurringTodo::where('user_id', $request->user()->id)->findOrFail($id);
        $recurringTodo->update(['state' => 'active']);

        return response()->json([
            'message' => 'Recurring todo resumed',
            'recurring_todo' => $recurringTodo,
        ]);
    }

    #[OA\Post(
        path: '/recurring-todos/generate',
        summary: 'Trigger generation of todos from recurring todos',
        description: 'Requires generate_recurring_todos permission',
        security: [['bearerAuth' => []]],
        tags: ['RecurringTodos'],
        requestBody: new OA\RequestBody(
            required: false,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'time_ahead', type: 'string', example: '1h', description: 'Time ahead to generate todos for (e.g., 1h, 1d)'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Todos generated successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Permission denied'),
        ]
    )]
    public function generate(Request $request, RecurringTodoService $service): JsonResponse
    {
        $validated = $request->validate([
            'time_ahead' => 'nullable|string|regex:/^\d+[hdwmy]$/',
        ]);

        $timeAhead = $validated['time_ahead'] ?? '1h';

        $generatedCount = $service->generate($timeAhead);

        return response()->json([
            'message' => "Generated {$generatedCount} todo".($generatedCount === 1 ? '' : 's'),
            'time_ahead' => $timeAhead,
            'generated_count' => $generatedCount,
        ]);
    }
}
