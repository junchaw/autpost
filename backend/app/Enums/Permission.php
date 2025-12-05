<?php

namespace App\Enums;

class Permission
{
    public const HARD_DELETE = 'hard_delete';

    public const GENERATE_RECURRING_TODOS = 'generate_recurring_todos';

    /**
     * Permission descriptions.
     */
    private const DESCRIPTIONS = [
        self::HARD_DELETE => 'Permanently delete records (bypass soft delete)',
        self::GENERATE_RECURRING_TODOS => 'Manually trigger recurring todo generation',
    ];

    /**
     * Get all available permissions.
     */
    public static function all(): array
    {
        return array_keys(self::DESCRIPTIONS);
    }

    /**
     * Get all permissions with descriptions.
     */
    public static function allWithDescriptions(): array
    {
        $result = [];
        foreach (self::DESCRIPTIONS as $permission => $description) {
            $result[] = [
                'value' => $permission,
                'label' => self::formatLabel($permission),
                'description' => $description,
            ];
        }

        return $result;
    }

    /**
     * Get description for a permission.
     */
    public static function description(string $permission): ?string
    {
        return self::DESCRIPTIONS[$permission] ?? null;
    }

    /**
     * Format permission key as human-readable label.
     */
    private static function formatLabel(string $permission): string
    {
        return ucwords(str_replace('_', ' ', $permission));
    }
}
