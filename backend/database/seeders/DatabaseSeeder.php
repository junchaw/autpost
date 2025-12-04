<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserConfig;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test user
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'secret',
        ]);

        // Create config for test user
        UserConfig::create([
            'user_id' => $user->id,
            'config' => [
                'panels' => [
                    [
                        'panel' => 'todo',
                        'sm' => ['widthMode' => 'column', 'width' => 24, 'height' => 300],
                        'md' => ['widthMode' => 'column', 'width' => 12, 'height' => 400],
                        'lg' => ['widthMode' => 'column', 'width' => 8, 'height' => 400],
                    ],
                    [
                        'panel' => 'note',
                        'sm' => ['widthMode' => 'column', 'width' => 24, 'height' => 300],
                        'md' => ['widthMode' => 'column', 'width' => 12, 'height' => 400],
                        'lg' => ['widthMode' => 'column', 'width' => 8, 'height' => 400],
                    ],
                ],
            ],
        ]);

        $this->call([
            RecurringTodoSeeder::class,
            TodoSeeder::class,
            NoteSeeder::class,
        ]);
    }
}
