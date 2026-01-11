<?php

use App\Jobs\GenerateRecurringTodos;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Recurring Todo Generation
|--------------------------------------------------------------------------
|
| Schedule the recurring todos job based on configuration.
| See config/autpost.php for configuration options.
|
*/
if (config('autpost.recurring_todo.enabled', true)) {
    $generationPeriod = config('autpost.recurring_todo.generation_period', '1h');
    $scheduleFrequency = config('autpost.recurring_todo.schedule_frequency', 'hourly');

    $schedule = Schedule::job(new GenerateRecurringTodos($generationPeriod));

    // Apply the configured frequency
    match ($scheduleFrequency) {
        'everyMinute' => $schedule->everyMinute(),
        'everyFiveMinutes' => $schedule->everyFiveMinutes(),
        'everyTenMinutes' => $schedule->everyTenMinutes(),
        'everyFifteenMinutes' => $schedule->everyFifteenMinutes(),
        'everyThirtyMinutes' => $schedule->everyThirtyMinutes(),
        'daily' => $schedule->daily(),
        default => $schedule->hourly(),
    };
}

/*
|--------------------------------------------------------------------------
| Access Log Cleanup
|--------------------------------------------------------------------------
|
| Schedule the access log cleanup to run daily.
| See config/autpost.php for retention configuration.
|
*/
if (config('autpost.access_log.retention_days', 30) > 0) {
    Schedule::command('access-logs:cleanup')->daily();
}

// Artisan command to manually trigger the recurring todos job
Artisan::command('todos:generate {timeAhead=1h}', function (string $timeAhead) {
    $this->info("Generating recurring todos for timeAhead={$timeAhead}...");
    GenerateRecurringTodos::dispatchSync($timeAhead);
    $this->info('Done!');
})->purpose('Generate todos from recurring todos. Format: 1h, 1d');
