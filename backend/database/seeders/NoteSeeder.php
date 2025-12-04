<?php

namespace Database\Seeders;

use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Seeder;

class NoteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();

        if (! $user) {
            $this->command->warn('No user found. Please run UserSeeder first.');

            return;
        }

        // Generate random notes with Faker
        $count = 15;

        for ($i = 0; $i < $count; $i++) {
            Note::create([
                'user_id' => $user->id,
                'content' => fake()->paragraphs(fake()->numberBetween(1, 3), true),
            ]);
        }

        $this->command->info("Created {$count} notes.");
    }
}
