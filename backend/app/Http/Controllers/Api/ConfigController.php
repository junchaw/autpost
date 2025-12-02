<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserConfig;
use Illuminate\Http\Request;

class ConfigController extends Controller
{
    /**
     * Get the user's dashboard configuration
     */
    public function show(Request $request)
    {
        $userId = $request->input('user_id', 'default');

        $userConfig = UserConfig::where('user_id', $userId)->first();

        if (!$userConfig) {
            // Return default config if none exists
            return response()->json([
                'config' => [
                    'panels' => []
                ]
            ]);
        }

        return response()->json([
            'config' => $userConfig->config
        ]);
    }

    /**
     * Update the user's dashboard configuration
     */
    public function update(Request $request)
    {
        $request->validate([
            'config' => 'required|array',
        ]);

        $userId = $request->input('user_id', 'default');

        $userConfig = UserConfig::updateOrCreate(
            ['user_id' => $userId],
            ['config' => $request->input('config')]
        );

        return response()->json([
            'message' => 'Configuration updated successfully',
            'config' => $userConfig->config
        ]);
    }
}
