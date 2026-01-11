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
}
