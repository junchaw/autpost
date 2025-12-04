<?php

use App\Jobs\GenerateRecurringTodos;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule the recurring todos job to run hourly to ensure that new todo items are generated as soon as it's a new day in any time zone,
// and to provide fault tolerance in case of missed executions.
Schedule::job(new GenerateRecurringTodos('1h'))->hourly();

// Artisan command to manually trigger the job
Artisan::command('todos:generate {timeAhead=1h}', function (string $timeAhead) {
    $this->info("Generating recurring todos for timeAhead={$timeAhead}...");
    GenerateRecurringTodos::dispatchSync($timeAhead);
    $this->info('Done!');
})->purpose('Generate todos from recurring todos. Format: 1h, 1d');
