<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RecurringTodo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecurringTodoController extends Controller
{
    /**
     * Get all recurring todos for a user
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'state' => 'nullable|in:active,paused',
            'include_deleted' => 'nullable|boolean',
        ]);

        $query = RecurringTodo::where('user_id', $request->user()->id);

        if ($request->has('state')) {
            $query->where('state', $request->input('state'));
        }

        if ($request->boolean('include_deleted')) {
            $query->withTrashed();
        }

        $recurringTodos = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'recurring_todos' => $recurringTodos,
        ]);
    }

    /**
     * Get a single recurring todo
     */
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

    /**
     * Create a new recurring todo
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'note' => 'nullable|string',
            'interval' => 'required|integer|min:1',
            'interval_unit' => 'required|in:day,week,month,year',
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

    /**
     * Update a recurring todo
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $recurringTodo = RecurringTodo::where('user_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'note' => 'nullable|string',
            'interval' => 'sometimes|integer|min:1',
            'interval_unit' => 'sometimes|in:day,week,month,year',
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

    /**
     * Soft delete a recurring todo
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $recurringTodo = RecurringTodo::where('user_id', $request->user()->id)->findOrFail($id);
        $recurringTodo->delete();

        return response()->json([
            'message' => 'Recurring todo deleted successfully',
        ]);
    }

    /**
     * Restore a soft-deleted recurring todo
     */
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

    /**
     * Permanently delete a recurring todo
     */
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

    /**
     * Pause a recurring todo
     */
    public function pause(Request $request, int $id): JsonResponse
    {
        $recurringTodo = RecurringTodo::where('user_id', $request->user()->id)->findOrFail($id);
        $recurringTodo->update(['state' => 'paused']);

        return response()->json([
            'message' => 'Recurring todo paused',
            'recurring_todo' => $recurringTodo,
        ]);
    }

    /**
     * Resume a recurring todo
     */
    public function resume(Request $request, int $id): JsonResponse
    {
        $recurringTodo = RecurringTodo::where('user_id', $request->user()->id)->findOrFail($id);
        $recurringTodo->update(['state' => 'active']);

        return response()->json([
            'message' => 'Recurring todo resumed',
            'recurring_todo' => $recurringTodo,
        ]);
    }
}
