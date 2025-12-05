<?php

namespace Database\Seeders;

use App\Enums\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin role with all permissions
        Role::updateOrCreate(
            ['name' => 'admin'],
            [
                'description' => 'Administrator with full permissions',
                'permissions' => Permission::all(),
            ]
        );

        // Create basic user role
        Role::updateOrCreate(
            ['name' => 'user'],
            [
                'description' => 'Regular user',
                'permissions' => [],
            ]
        );
    }
}
