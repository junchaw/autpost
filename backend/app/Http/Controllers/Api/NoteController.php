<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Notes', description: 'Note management endpoints')]
class NoteController extends Controller
{
    #[OA\Get(
        path: '/notes',
        summary: 'Get all notes for the authenticated user',
        security: [['bearerAuth' => []]],
        tags: ['Notes'],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'List of notes with pagination'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
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

    #[OA\Get(
        path: '/notes/{id}',
        summary: 'Get a single note',
        security: [['bearerAuth' => []]],
        tags: ['Notes'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Note details'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Note not found'),
        ]
    )]
    public function show(Request $request, int $id): JsonResponse
    {
        $note = Note::where('user_id', $request->user()->id)->findOrFail($id);

        return response()->json([
            'note' => $note,
        ]);
    }

    #[OA\Post(
        path: '/notes',
        summary: 'Create a new note',
        security: [['bearerAuth' => []]],
        tags: ['Notes'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['content'],
                properties: [
                    new OA\Property(property: 'content', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Note created successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
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

    #[OA\Put(
        path: '/notes/{id}',
        summary: 'Update a note',
        security: [['bearerAuth' => []]],
        tags: ['Notes'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['content'],
                properties: [
                    new OA\Property(property: 'content', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Note updated successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Note not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
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

    #[OA\Delete(
        path: '/notes/{id}',
        summary: 'Soft delete a note',
        security: [['bearerAuth' => []]],
        tags: ['Notes'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Note deleted successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Note not found'),
        ]
    )]
    public function destroy(Request $request, int $id): JsonResponse
    {
        $note = Note::where('user_id', $request->user()->id)->findOrFail($id);
        $note->delete();

        return response()->json([
            'message' => 'Note deleted successfully',
        ]);
    }

    #[OA\Post(
        path: '/notes/{id}/restore',
        summary: 'Restore a soft-deleted note',
        security: [['bearerAuth' => []]],
        tags: ['Notes'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Note restored successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Note not found'),
        ]
    )]
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

    #[OA\Delete(
        path: '/notes/{id}/force',
        summary: 'Permanently delete a note',
        security: [['bearerAuth' => []]],
        tags: ['Notes'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Note permanently deleted'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Note not found'),
        ]
    )]
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
