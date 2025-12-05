<?php

namespace App\Http\Controllers\Api;

use App\Enums\FieldType;
use App\Http\Controllers\Controller;
use App\Models\GenericDefinition;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Generic Definitions', description: 'Schema definition management endpoints')]
class GenericDefinitionController extends Controller
{
    #[OA\Get(
        path: '/definitions',
        summary: 'Get all definitions with pagination',
        security: [['bearerAuth' => []]],
        tags: ['Generic Definitions'],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'List of definitions with pagination'),
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

        $definitions = GenericDefinition::definitions()
            ->orderBy('name')
            ->paginate($perPage);

        return response()->json([
            'definitions' => $definitions->items(),
            'pagination' => [
                'current_page' => $definitions->currentPage(),
                'per_page' => $definitions->perPage(),
                'total' => $definitions->total(),
            ],
        ]);
    }

    #[OA\Get(
        path: '/definitions/field-types',
        summary: 'Get available field types',
        security: [['bearerAuth' => []]],
        tags: ['Generic Definitions'],
        responses: [
            new OA\Response(response: 200, description: 'List of field types'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function fieldTypes(): JsonResponse
    {
        return response()->json([
            'field_types' => FieldType::options(),
        ]);
    }

    #[OA\Get(
        path: '/definitions/{id}',
        summary: 'Get a single definition',
        security: [['bearerAuth' => []]],
        tags: ['Generic Definitions'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Definition details'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Definition not found'),
        ]
    )]
    public function show(string $id): JsonResponse
    {
        $definition = GenericDefinition::definitions()->findOrFail($id);

        return response()->json([
            'definition' => $definition,
        ]);
    }

    #[OA\Get(
        path: '/definitions/by-type/{type}',
        summary: 'Get a definition by type',
        security: [['bearerAuth' => []]],
        tags: ['Generic Definitions'],
        parameters: [
            new OA\Parameter(name: 'type', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Definition details'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Definition not found'),
        ]
    )]
    public function showByType(string $type): JsonResponse
    {
        $definition = GenericDefinition::definitions()
            ->where('type', $type)
            ->firstOrFail();

        return response()->json([
            'definition' => $definition,
        ]);
    }

    #[OA\Post(
        path: '/definitions',
        summary: 'Create a new definition',
        security: [['bearerAuth' => []]],
        tags: ['Generic Definitions'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['type', 'name'],
                properties: [
                    new OA\Property(property: 'type', type: 'string', description: 'Unique type identifier'),
                    new OA\Property(property: 'name', type: 'string', description: 'Human-readable name'),
                    new OA\Property(property: 'description', type: 'string', nullable: true),
                    new OA\Property(property: 'icon', type: 'string', nullable: true),
                    new OA\Property(property: 'parent', type: 'string', nullable: true, description: 'Parent definition type'),
                    new OA\Property(property: 'fields', type: 'object', description: 'Map of field name to field schema'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Definition created successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'parent' => 'nullable|string|max:255',
            'fields' => 'nullable|array',
        ]);

        // Check if type already exists
        $existing = GenericDefinition::definitions()
            ->where('type', $validated['type'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'A definition with this type already exists',
            ], 422);
        }

        $definition = GenericDefinition::create([
            'type' => $validated['type'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'icon' => $validated['icon'] ?? null,
            'parent' => $validated['parent'] ?? null,
            'fields' => $validated['fields'] ?? [],
        ]);

        return response()->json([
            'message' => 'Definition created successfully',
            'definition' => $definition,
        ], 201);
    }

    #[OA\Put(
        path: '/definitions/{id}',
        summary: 'Update a definition',
        security: [['bearerAuth' => []]],
        tags: ['Generic Definitions'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'type', type: 'string'),
                    new OA\Property(property: 'name', type: 'string'),
                    new OA\Property(property: 'description', type: 'string', nullable: true),
                    new OA\Property(property: 'icon', type: 'string', nullable: true),
                    new OA\Property(property: 'parent', type: 'string', nullable: true),
                    new OA\Property(property: 'fields', type: 'object'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Definition updated successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Definition not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(Request $request, string $id): JsonResponse
    {
        $definition = GenericDefinition::definitions()->findOrFail($id);

        $validated = $request->validate([
            'type' => 'sometimes|string|max:255',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'parent' => 'nullable|string|max:255',
            'fields' => 'nullable|array',
        ]);

        // Check if type is being changed and already exists
        if (isset($validated['type']) && $validated['type'] !== $definition->type) {
            $existing = GenericDefinition::definitions()
                ->where('type', $validated['type'])
                ->first();

            if ($existing) {
                return response()->json([
                    'message' => 'A definition with this type already exists',
                ], 422);
            }
        }

        $definition->update($validated);

        return response()->json([
            'message' => 'Definition updated successfully',
            'definition' => $definition,
        ]);
    }

    #[OA\Delete(
        path: '/definitions/{id}',
        summary: 'Delete a definition',
        security: [['bearerAuth' => []]],
        tags: ['Generic Definitions'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Definition deleted successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Definition not found'),
        ]
    )]
    public function destroy(string $id): JsonResponse
    {
        $definition = GenericDefinition::definitions()->findOrFail($id);
        $definition->delete();

        return response()->json([
            'message' => 'Definition deleted successfully',
        ]);
    }
}
