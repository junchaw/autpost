<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RoleBinding;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Role Bindings', description: 'Role binding management endpoints')]
class RoleBindingController extends Controller
{
    #[OA\Get(
        path: '/role-bindings',
        summary: 'Get all role bindings with pagination',
        security: [['bearerAuth' => []]],
        tags: ['Role Bindings'],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'user_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'role_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'List of role bindings with pagination'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
            'user_id' => 'nullable|integer|exists:users,id',
            'role_id' => 'nullable|integer|exists:roles,id',
        ]);

        $perPage = $request->input('per_page', 20);

        $query = RoleBinding::with(['user', 'role']);

        if ($request->has('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        if ($request->has('role_id')) {
            $query->where('role_id', $request->input('role_id'));
        }

        $bindings = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'role_bindings' => $bindings->items(),
            'pagination' => [
                'current_page' => $bindings->currentPage(),
                'per_page' => $bindings->perPage(),
                'total' => $bindings->total(),
            ],
        ]);
    }

    #[OA\Get(
        path: '/role-bindings/{id}',
        summary: 'Get a single role binding',
        security: [['bearerAuth' => []]],
        tags: ['Role Bindings'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Role binding details'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Role binding not found'),
        ]
    )]
    public function show(int $id): JsonResponse
    {
        $binding = RoleBinding::with(['user', 'role'])->findOrFail($id);

        return response()->json([
            'role_binding' => $binding,
        ]);
    }

    #[OA\Post(
        path: '/role-bindings',
        summary: 'Create a new role binding',
        security: [['bearerAuth' => []]],
        tags: ['Role Bindings'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['user_id', 'role_id'],
                properties: [
                    new OA\Property(property: 'user_id', type: 'integer'),
                    new OA\Property(property: 'role_id', type: 'integer'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Role binding created successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'role_id' => 'required|integer|exists:roles,id',
        ]);

        // Check if binding already exists
        $exists = RoleBinding::where('user_id', $validated['user_id'])
            ->where('role_id', $validated['role_id'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Role binding already exists',
            ], 422);
        }

        $binding = RoleBinding::create($validated);
        $binding->load(['user', 'role']);

        return response()->json([
            'message' => 'Role binding created successfully',
            'role_binding' => $binding,
        ], 201);
    }

    #[OA\Delete(
        path: '/role-bindings/{id}',
        summary: 'Delete a role binding',
        security: [['bearerAuth' => []]],
        tags: ['Role Bindings'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Role binding deleted successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Role binding not found'),
        ]
    )]
    public function destroy(int $id): JsonResponse
    {
        $binding = RoleBinding::findOrFail($id);
        $binding->delete();

        return response()->json([
            'message' => 'Role binding deleted successfully',
        ]);
    }

    #[OA\Get(
        path: '/users',
        summary: 'Get all users for role binding selection',
        security: [['bearerAuth' => []]],
        tags: ['Role Bindings'],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'search', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'List of users'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function users(Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
            'search' => 'nullable|string',
        ]);

        $perPage = $request->input('per_page', 20);

        $query = User::select('id', 'name', 'email');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%');
            });
        }

        $users = $query->orderBy('name')->paginate($perPage);

        return response()->json([
            'users' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }
}
