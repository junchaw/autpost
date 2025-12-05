<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserConfig;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Config', description: 'User configuration endpoints')]
class ConfigController extends Controller
{
    #[OA\Get(
        path: '/config',
        summary: 'Get the user\'s dashboard configuration',
        security: [['bearerAuth' => []]],
        tags: ['Config'],
        responses: [
            new OA\Response(response: 200, description: 'User configuration'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function show(Request $request)
    {
        $userId = $request->user()->id;

        $userConfig = UserConfig::where('user_id', $userId)->first();

        if (! $userConfig) {
            // Return default config if none exists
            return response()->json([
                'config' => [
                    'panels' => [],
                ],
            ]);
        }

        return response()->json([
            'config' => $userConfig->config,
        ]);
    }

    #[OA\Put(
        path: '/config',
        summary: 'Update the user\'s dashboard configuration',
        security: [['bearerAuth' => []]],
        tags: ['Config'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['config'],
                properties: [
                    new OA\Property(property: 'config', type: 'object', description: 'Dashboard configuration object'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Configuration updated successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(Request $request)
    {
        $request->validate([
            'config' => 'required|array',
        ]);

        $userId = $request->user()->id;

        $userConfig = UserConfig::updateOrCreate(
            ['user_id' => $userId],
            ['config' => $request->input('config')]
        );

        return response()->json([
            'message' => 'Configuration updated successfully',
            'config' => $userConfig->config,
        ]);
    }
}
