<?php

namespace Database\Seeders;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Database\Seeder;

class TodoSeeder extends Seeder
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

        $states = ['pending', 'in_progress', 'completed', 'cancelled'];

        // Predefined meaningful todos
        $todos = [
            ['title' => 'Review pull request #42', 'note' => 'Check for security issues and code quality'],
            ['title' => 'Update documentation', 'note' => 'Add API endpoints for new features'],
            ['title' => 'Fix login bug', 'note' => 'Users unable to login with special characters in password'],
            ['title' => 'Deploy to staging', 'note' => null],
            ['title' => 'Write unit tests', 'note' => 'Cover edge cases for payment module'],
            ['title' => 'Optimize database queries', 'note' => 'Slow queries on user dashboard'],
            ['title' => 'Setup CI/CD pipeline', 'note' => 'Configure GitHub Actions for automated testing'],
            ['title' => 'Code review meeting', 'note' => 'Discuss new coding standards'],
            ['title' => 'Refactor authentication module', 'note' => 'Move to Laravel Sanctum'],
            ['title' => 'Create API documentation', 'note' => 'Use OpenAPI/Swagger spec'],
            ['title' => 'Fix responsive layout', 'note' => 'Mobile view broken on checkout page'],
            ['title' => 'Add error logging', 'note' => 'Integrate Sentry for error tracking'],
            ['title' => 'Performance audit', 'note' => 'Run Lighthouse tests and fix issues'],
            ['title' => 'Update dependencies', 'note' => 'Security patches for npm packages'],
            ['title' => 'Implement dark mode', 'note' => 'Follow system preference by default'],
        ];

        foreach ($todos as $index => $data) {
            $state = fake()->randomElement($states);
            $dueTime = fake()->optional(0.8)->dateTimeBetween('-1 week', '+2 weeks');

            Todo::create([
                'user_id' => $user->id,
                'recurring_todo_id' => null,
                'title' => $data['title'],
                'note' => $data['note'],
                'due_time' => $dueTime,
                'state' => $state,
            ]);
        }

        // Add some random todos with Faker
        for ($i = 0; $i < 10; $i++) {
            $state = fake()->randomElement($states);
            $dueTime = fake()->optional(0.7)->dateTimeBetween('-3 days', '+1 month');

            Todo::create([
                'user_id' => $user->id,
                'recurring_todo_id' => null,
                'title' => fake()->sentence(fake()->numberBetween(3, 8)),
                'note' => fake()->optional(0.6)->paragraph(1),
                'due_time' => $dueTime,
                'state' => $state,
            ]);
        }

        $this->command->info('Created '.(count($todos) + 10).' todos.');
    }
}
