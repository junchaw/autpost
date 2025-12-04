<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Todo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TodoController extends Controller
{
    /**
     * Get all todos for a user with pagination
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'state' => 'nullable|in:pending,in_progress,completed,cancelled',
            'include_deleted' => 'nullable|boolean',
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
        ]);

        $query = Todo::where('user_id', $request->user()->id);

        if ($request->has('state')) {
            $query->where('state', $request->input('state'));
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

    /**
     * Get a single todo
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $todo = Todo::withTrashed()
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'todo' => $todo,
        ]);
    }

    /**
     * Create a new todo
     */
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

    /**
     * Update a todo
     */
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

    /**
     * Soft delete a todo
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $todo = Todo::where('user_id', $request->user()->id)->findOrFail($id);
        $todo->delete();

        return response()->json([
            'message' => 'Todo deleted successfully',
        ]);
    }

    /**
     * Restore a soft-deleted todo
     */
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

    /**
     * Permanently delete a todo
     */
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
