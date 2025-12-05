<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GenericDefinition;
use App\Models\GenericResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Generic Resources', description: 'Dynamic resource management endpoints')]
class GenericResourceController extends Controller
{
    #[OA\Get(
        path: '/resources/{type}',
        summary: 'Get all resources of a specific type with pagination',
        security: [['bearerAuth' => []]],
        tags: ['Generic Resources'],
        parameters: [
            new OA\Parameter(name: 'type', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'List of resources with pagination'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Definition not found'),
        ]
    )]
    public function index(Request $request, string $type): JsonResponse
    {
        // Verify definition exists
        $definition = GenericDefinition::definitions()
            ->where('type', $type)
            ->first();

        if (! $definition) {
            return response()->json([
                'message' => 'Definition not found for type: '.$type,
            ], 404);
        }

        $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
        ]);

        $perPage = $request->input('per_page', 20);

        $resources = GenericResource::ofType($type)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'resources' => $resources->items(),
            'definition' => $definition,
            'pagination' => [
                'current_page' => $resources->currentPage(),
                'per_page' => $resources->perPage(),
                'total' => $resources->total(),
            ],
        ]);
    }

    #[OA\Get(
        path: '/resources/{type}/{id}',
        summary: 'Get a single resource',
        security: [['bearerAuth' => []]],
        tags: ['Generic Resources'],
        parameters: [
            new OA\Parameter(name: 'type', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Resource details'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Resource not found'),
        ]
    )]
    public function show(string $type, string $id): JsonResponse
    {
        $resource = GenericResource::ofType($type)->findOrFail($id);
        $definition = $resource->getDefinition();

        return response()->json([
            'resource' => $resource,
            'definition' => $definition,
        ]);
    }

    #[OA\Post(
        path: '/resources/{type}',
        summary: 'Create a new resource',
        security: [['bearerAuth' => []]],
        tags: ['Generic Resources'],
        parameters: [
            new OA\Parameter(name: 'type', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['data'],
                properties: [
                    new OA\Property(property: 'data', type: 'object', description: 'Resource data based on definition schema'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Resource created successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Definition not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(Request $request, string $type): JsonResponse
    {
        // Verify definition exists
        $definition = GenericDefinition::definitions()
            ->where('type', $type)
            ->first();

        if (! $definition) {
            return response()->json([
                'message' => 'Definition not found for type: '.$type,
            ], 404);
        }

        $validated = $request->validate([
            'data' => 'required|array',
        ]);

        // Validate required fields based on definition
        $errors = $this->validateResourceData($definition, $validated['data']);
        if (! empty($errors)) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $errors,
            ], 422);
        }

        $resource = new GenericResource;
        $resource->_type = $type;
        $resource->data = $validated['data'];
        $resource->save();

        return response()->json([
            'message' => 'Resource created successfully',
            'resource' => $resource,
        ], 201);
    }

    #[OA\Put(
        path: '/resources/{type}/{id}',
        summary: 'Update a resource',
        security: [['bearerAuth' => []]],
        tags: ['Generic Resources'],
        parameters: [
            new OA\Parameter(name: 'type', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['data'],
                properties: [
                    new OA\Property(property: 'data', type: 'object', description: 'Resource data based on definition schema'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Resource updated successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Resource not found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(Request $request, string $type, string $id): JsonResponse
    {
        $resource = GenericResource::ofType($type)->findOrFail($id);
        $definition = $resource->getDefinition();

        $validated = $request->validate([
            'data' => 'required|array',
        ]);

        // Validate required fields based on definition
        if ($definition) {
            $errors = $this->validateResourceData($definition, $validated['data']);
            if (! empty($errors)) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $errors,
                ], 422);
            }
        }

        $resource->data = $validated['data'];
        $resource->save();

        return response()->json([
            'message' => 'Resource updated successfully',
            'resource' => $resource,
        ]);
    }

    #[OA\Delete(
        path: '/resources/{type}/{id}',
        summary: 'Delete a resource',
        security: [['bearerAuth' => []]],
        tags: ['Generic Resources'],
        parameters: [
            new OA\Parameter(name: 'type', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Resource deleted successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 404, description: 'Resource not found'),
        ]
    )]
    public function destroy(string $type, string $id): JsonResponse
    {
        $resource = GenericResource::ofType($type)->findOrFail($id);
        $resource->delete();

        return response()->json([
            'message' => 'Resource deleted successfully',
        ]);
    }

    /**
     * Validate resource data against definition schema.
     */
    private function validateResourceData(GenericDefinition $definition, array $data): array
    {
        $errors = [];
        $fields = $definition->fields ?? [];

        foreach ($fields as $fieldName => $fieldSchema) {
            $isRequired = $fieldSchema['required'] ?? false;
            $hasValue = isset($data[$fieldName]) && $data[$fieldName] !== '' && $data[$fieldName] !== null;

            if ($isRequired && ! $hasValue) {
                $label = $fieldSchema['label'] ?? $fieldName;
                $errors[$fieldName] = ["The {$label} field is required."];
            }
        }

        return $errors;
    }
}
