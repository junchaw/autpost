<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    /**
     * Get all notes for a user with pagination
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
        ]);

        $perPage = $request->input('per_page', 20);

        $notes = Note::where('user_id', $request->user()->id)
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'notes' => $notes->items(),
            'pagination' => [
                'current_page' => $notes->currentPage(),
                'per_page' => $notes->perPage(),
                'total' => $notes->total(),
            ],
        ]);
    }

    /**
     * Get a single note
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $note = Note::where('user_id', $request->user()->id)->findOrFail($id);

        return response()->json([
            'note' => $note,
        ]);
    }

    /**
     * Create a new note
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $validated['user_id'] = $request->user()->id;
        $note = Note::create($validated);

        return response()->json([
            'message' => 'Note created successfully',
            'note' => $note,
        ], 201);
    }

    /**
     * Update a note
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $note = Note::where('user_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $note->update($validated);

        return response()->json([
            'message' => 'Note updated successfully',
            'note' => $note,
        ]);
    }

    /**
     * Soft delete a note
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $note = Note::where('user_id', $request->user()->id)->findOrFail($id);
        $note->delete();

        return response()->json([
            'message' => 'Note deleted successfully',
        ]);
    }

    /**
     * Restore a soft-deleted note
     */
    public function restore(Request $request, int $id): JsonResponse
    {
        $note = Note::withTrashed()
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);
        $note->restore();

        return response()->json([
            'message' => 'Note restored successfully',
            'note' => $note,
        ]);
    }

    /**
     * Permanently delete a note
     */
    public function forceDelete(Request $request, int $id): JsonResponse
    {
        $note = Note::withTrashed()
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);
        $note->forceDelete();

        return response()->json([
            'message' => 'Note permanently deleted',
        ]);
    }
}
