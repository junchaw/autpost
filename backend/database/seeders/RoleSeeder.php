<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin role with hard_delete permission
        Role::firstOrCreate(
            ['name' => 'admin'],
            [
                'description' => 'Administrator with full permissions',
                'permissions' => ['hard_delete'],
            ]
        );

        // Create basic user role
        Role::firstOrCreate(
            ['name' => 'user'],
            [
                'description' => 'Regular user',
                'permissions' => [],
            ]
        );
    }
}
