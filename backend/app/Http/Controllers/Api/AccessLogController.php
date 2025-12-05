<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccessLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Access Logs', description: 'Access log management endpoints')]
class AccessLogController extends Controller
{
    #[OA\Get(
        path: '/access-logs',
        summary: 'Get all access logs with pagination',
        security: [['bearerAuth' => []]],
        tags: ['Access Logs'],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'source', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'path', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'ip', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'List of access logs with pagination'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
            'source' => 'nullable|string',
            'path' => 'nullable|string',
            'ip' => 'nullable|string',
        ]);

        $perPage = $request->input('per_page', 20);

        $query = AccessLog::query();

        if ($request->has('source')) {
            $query->where('source', 'like', '%'.$request->input('source').'%');
        }

        if ($request->has('path')) {
            $query->where('path', 'like', '%'.$request->input('path').'%');
        }

        if ($request->has('ip')) {
            $query->where('ip', 'like', '%'.$request->input('ip').'%');
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'access_logs' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    #[OA\Get(
        path: '/access-logs/{id}',
        summary: 'Get a single access log',
        security: [['bearerAuth' => []]],
        tags: ['Access Logs'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Access log details'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Access log not found'),
        ]
    )]
    public function show(int $id): JsonResponse
    {
        $log = AccessLog::findOrFail($id);

        return response()->json([
            'access_log' => $log,
        ]);
    }

    #[OA\Post(
        path: '/access-logs',
        summary: 'Create a new access log',
        security: [['bearerAuth' => []]],
        tags: ['Access Logs'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['source', 'path', 'ip', 'user_agent'],
                properties: [
                    new OA\Property(property: 'source', type: 'string'),
                    new OA\Property(property: 'path', type: 'string'),
                    new OA\Property(property: 'ip', type: 'string'),
                    new OA\Property(property: 'user_agent', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Access log created successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'source' => 'required|string|max:255',
            'path' => 'required|string|max:255',
            'ip' => 'required|string|max:45',
            'user_agent' => 'required|string',
        ]);

        $log = AccessLog::create($validated);

        return response()->json([
            'message' => 'Access log created successfully',
            'access_log' => $log,
        ], 201);
    }

    #[OA\Put(
        path: '/access-logs/{id}',
        summary: 'Update an access log',
        security: [['bearerAuth' => []]],
        tags: ['Access Logs'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'source', type: 'string'),
                    new OA\Property(property: 'path', type: 'string'),
                    new OA\Property(property: 'ip', type: 'string'),
                    new OA\Property(property: 'user_agent', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Access log updated successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Access log not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(Request $request, int $id): JsonResponse
    {
        $log = AccessLog::findOrFail($id);

        $validated = $request->validate([
            'source' => 'sometimes|string|max:255',
            'path' => 'sometimes|string|max:255',
            'ip' => 'sometimes|string|max:45',
            'user_agent' => 'sometimes|string',
        ]);

        $log->update($validated);

        return response()->json([
            'message' => 'Access log updated successfully',
            'access_log' => $log,
        ]);
    }

    #[OA\Delete(
        path: '/access-logs/{id}',
        summary: 'Delete an access log',
        security: [['bearerAuth' => []]],
        tags: ['Access Logs'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Access log deleted successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Access log not found'),
        ]
    )]
    public function destroy(int $id): JsonResponse
    {
        $log = AccessLog::findOrFail($id);
        $log->delete();

        return response()->json([
            'message' => 'Access log deleted successfully',
        ]);
    }
}
