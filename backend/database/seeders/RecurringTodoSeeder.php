<?php

namespace Database\Seeders;

use App\Models\RecurringTodo;
use App\Models\User;
use Illuminate\Database\Seeder;

class RecurringTodoSeeder extends Seeder
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

        $intervalUnits = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'];

        $recurringTodos = [
            [
                'title' => 'Daily standup meeting',
                'note' => 'Sync with the team on progress and blockers',
                'interval' => 1,
                'interval_unit' => 'day',
                'start_time' => now()->subDays(30),
            ],
            [
                'title' => 'Weekly report',
                'note' => 'Prepare and submit weekly progress report',
                'interval' => 1,
                'interval_unit' => 'week',
                'start_time' => now()->subWeeks(8),
            ],
            [
                'title' => 'Monthly review',
                'note' => 'Review monthly goals and achievements',
                'interval' => 1,
                'interval_unit' => 'month',
                'start_time' => now()->subMonths(6),
            ],
            [
                'title' => 'Backup database',
                'note' => 'Run automated backup verification',
                'interval' => 6,
                'interval_unit' => 'hour',
                'start_time' => now()->subDays(7),
            ],
            [
                'title' => 'Check server health',
                'note' => 'Monitor CPU, memory, and disk usage',
                'interval' => 30,
                'interval_unit' => 'minute',
                'start_time' => now()->subHours(24),
            ],
            [
                'title' => 'Yearly review',
                'note' => 'Annual performance and goals review',
                'interval' => 1,
                'interval_unit' => 'year',
                'start_time' => now()->subYears(2),
            ],
            [
                'title' => 'Water plants',
                'note' => 'Water all office plants',
                'interval' => 3,
                'interval_unit' => 'day',
                'start_time' => now()->subDays(15),
            ],
            [
                'title' => 'Team lunch',
                'note' => 'Bi-weekly team lunch outing',
                'interval' => 2,
                'interval_unit' => 'week',
                'start_time' => now()->subWeeks(4),
            ],
            // Added row as per instruction
            [
                'title' => 'Test Recurring Every Minute',
                'note' => 'This is a test recurring todo for every minute, paused by default.',
                'interval' => 1,
                'interval_unit' => 'minute',
                'start_time' => now()->subMinutes(5),
                'state' => 'paused',
            ],
        ];

        foreach ($recurringTodos as $data) {
            RecurringTodo::create([
                'user_id' => $user->id,
                'title' => $data['title'],
                'note' => $data['note'],
                'interval' => $data['interval'],
                'interval_unit' => $data['interval_unit'],
                'start_time' => $data['start_time'],
                'end_time' => fake()->optional(0.3)->dateTimeBetween('now', '+1 year'),
                'state' => $data['state'] ?? fake()->randomElement(['active', 'active', 'active', 'paused']), // 75% active, except test row forced paused
            ]);
        }

        $this->command->info('Created '.count($recurringTodos).' recurring todos.');
    }
}
