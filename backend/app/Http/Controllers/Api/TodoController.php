<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Todo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Todos', description: 'Todo management endpoints')]
class TodoController extends Controller
{
    #[OA\Get(
        path: '/todos',
        summary: 'Get all todos for the authenticated user',
        security: [['bearerAuth' => []]],
        tags: ['Todos'],
        parameters: [
            new OA\Parameter(name: 'states', in: 'query', required: false, schema: new OA\Schema(type: 'string', description: 'Comma-separated states to filter by (e.g., pending,in_progress)')),
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'List of todos with pagination'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'states' => 'nullable|string',
            'include_deleted' => 'nullable|boolean',
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
        ]);

        $query = Todo::where('user_id', $request->user()->id);

        if ($request->has('states')) {
            $states = array_filter(explode(',', $request->input('states')));
            if (! empty($states)) {
                $query->whereIn('state', $states);
            }
        }

        if ($request->boolean('include_deleted')) {
            $query->withTrashed();
        }

        $perPage = $request->input('per_page', 20);

        $todos = $query->orderBy('due_time', 'asc')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'todos' => $todos->items(),
            'pagination' => [
                'current_page' => $todos->currentPage(),
                'per_page' => $todos->perPage(),
                'total' => $todos->total(),
            ],
        ]);
    }

    #[OA\Get(
        path: '/todos/{id}',
        summary: 'Get a single todo',
        security: [['bearerAuth' => []]],
        tags: ['Todos'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Todo details'),
            new OA\Response(response: 404, description: 'Todo not found'),
        ]
    )]
    public function show(Request $request, int $id): JsonResponse
    {
        $todo = Todo::withTrashed()
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'todo' => $todo,
        ]);
    }

    #[OA\Post(
        path: '/todos',
        summary: 'Create a new todo',
        security: [['bearerAuth' => []]],
        tags: ['Todos'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['title'],
                properties: [
                    new OA\Property(property: 'recurring_todo_id', type: 'integer', nullable: true),
                    new OA\Property(property: 'title', type: 'string', maxLength: 25),
                    new OA\Property(property: 'note', type: 'string', maxLength: 25, nullable: true),
                    new OA\Property(property: 'due_time', type: 'string', format: 'date-time', nullable: true),
                    new OA\Property(property: 'is_whole_day', type: 'boolean', nullable: true),
                    new OA\Property(property: 'state', type: 'string', enum: ['pending', 'in_progress', 'completed', 'cancelled'], nullable: true),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Todo created successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'recurring_todo_id' => 'nullable|exists:recurring_todos,id',
            'title' => 'required|string|max:25',
            'note' => 'nullable|string|max:25',
            'due_time' => 'nullable|date',
            'is_whole_day' => 'nullable|boolean',
            'state' => 'nullable|in:pending,in_progress,completed,cancelled',
        ]);

        $validated['user_id'] = $request->user()->id;
        $todo = Todo::create($validated);

        return response()->json([
            'message' => 'Todo created successfully',
            'todo' => $todo,
        ], 201);
    }

    #[OA\Put(
        path: '/todos/{id}',
        summary: 'Update a todo',
        security: [['bearerAuth' => []]],
        tags: ['Todos'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'title', type: 'string', maxLength: 255),
                    new OA\Property(property: 'note', type: 'string', nullable: true),
                    new OA\Property(property: 'due_time', type: 'string', format: 'date-time', nullable: true),
                    new OA\Property(property: 'is_whole_day', type: 'boolean', nullable: true),
                    new OA\Property(property: 'state', type: 'string', enum: ['pending', 'in_progress', 'completed', 'cancelled'], nullable: true),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Todo updated successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Todo not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(Request $request, int $id): JsonResponse
    {
        $todo = Todo::where('user_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'note' => 'nullable|string',
            'due_time' => 'nullable|date',
            'is_whole_day' => 'nullable|boolean',
            'state' => 'nullable|in:pending,in_progress,completed,cancelled',
        ]);

        $todo->update($validated);

        return response()->json([
            'message' => 'Todo updated successfully',
            'todo' => $todo,
        ]);
    }

    #[OA\Delete(
        path: '/todos/{id}',
        summary: 'Soft delete a todo',
        security: [['bearerAuth' => []]],
        tags: ['Todos'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Todo deleted successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Todo not found'),
        ]
    )]
    public function destroy(Request $request, int $id): JsonResponse
    {
        $todo = Todo::where('user_id', $request->user()->id)->findOrFail($id);
        $todo->delete();

        return response()->json([
            'message' => 'Todo deleted successfully',
        ]);
    }

    #[OA\Post(
        path: '/todos/{id}/restore',
        summary: 'Restore a soft-deleted todo',
        security: [['bearerAuth' => []]],
        tags: ['Todos'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Todo restored successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Todo not found'),
        ]
    )]
    public function restore(Request $request, int $id): JsonResponse
    {
        $todo = Todo::withTrashed()
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);
        $todo->restore();

        return response()->json([
            'message' => 'Todo restored successfully',
            'todo' => $todo,
        ]);
    }

    #[OA\Delete(
        path: '/todos/{id}/force',
        summary: 'Permanently delete a todo',
        security: [['bearerAuth' => []]],
        tags: ['Todos'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Todo permanently deleted'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Todo not found'),
        ]
    )]
    public function forceDelete(Request $request, int $id): JsonResponse
    {
        $todo = Todo::withTrashed()
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);
        $todo->forceDelete();

        return response()->json([
            'message' => 'Todo permanently deleted',
        ]);
    }
}
