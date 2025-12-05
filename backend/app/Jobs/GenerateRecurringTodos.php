<?php

namespace App\Jobs;

use App\Models\RecurringTodo;
use App\Models\Todo;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class GenerateRecurringTodos implements ShouldQueue
{
    use Queueable;

    protected string $timeAhead;

    /**
     * Create a new job instance.
     *
     * @param  string  $timeAhead  Time ahead to generate todos for (e.g., "1h", "2d", "1w", "30m", "30s")
     *                             Supported units: s (seconds), m (minutes), h (hours), d (days), w (weeks)
     */
    public function __construct(string $timeAhead = '7d')
    {
        $this->timeAhead = $timeAhead;
    }

    /**
     * Parse the timeAhead string into seconds
     *
     * @param  string  $timeAhead  e.g., "1h", "2d", "1w", "30m", "30s"
     * @return int seconds
     */
    protected function parseTimeAhead(string $timeAhead): int
    {
        if (! preg_match('/^(\d+)([smhdw])$/', strtolower($timeAhead), $matches)) {
            // Default to 7 days if invalid format
            Log::warning("Invalid timeAhead format: {$timeAhead}, defaulting to 7d");

            return 7 * 24 * 60 * 60;
        }

        $value = (int) $matches[1];
        $unit = $matches[2];

        return match ($unit) {
            's' => $value,
            'm' => $value * 60,
            'h' => $value * 60 * 60,
            'd' => $value * 24 * 60 * 60,
            'w' => $value * 7 * 24 * 60 * 60,
            default => 7 * 24 * 60 * 60,
        };
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $now = Carbon::now();
        $secondsAhead = $this->parseTimeAhead($this->timeAhead);
        $endDateTime = $now->copy()->addSeconds($secondsAhead);

        // Get all active recurring todos that should generate items
        $recurringTodos = RecurringTodo::where('state', 'active')
            ->where('start_time', '<=', $endDateTime)
            ->where(function ($query) use ($now) {
                $query->whereNull('end_time')
                    ->orWhere('end_time', '>=', $now);
            })
            ->get();

        $generatedCount = 0;

        foreach ($recurringTodos as $recurringTodo) {
            $generatedCount += $this->generateTodosForRecurring($recurringTodo, $now, $endDateTime);
        }

        Log::info("GenerateRecurringTodos job completed. Generated {$generatedCount} todos for timeAhead={$this->timeAhead}.");
    }

    /**
     * Generate todos for a single recurring todo
     */
    protected function generateTodosForRecurring(RecurringTodo $recurringTodo, Carbon $startRange, Carbon $endRange): int
    {
        $generatedCount = 0;
        $startTime = Carbon::parse($recurringTodo->start_time);

        // Calculate all occurrences within the range using math
        $occurrences = $this->getOccurrencesInRange($startTime, $startRange, $endRange, $recurringTodo);

        foreach ($occurrences as $occurrenceDate) {
            // Check if end_time is set and occurrence exceeds it
            if ($recurringTodo->end_time && $occurrenceDate->gt($recurringTodo->end_time)) {
                continue;
            }

            // Check if a todo already exists for this recurring todo at this time
            // For sub-day intervals, we check exact datetime match
            $existingTodo = $this->checkExistingTodo($recurringTodo, $occurrenceDate);

            if (! $existingTodo) {
                Todo::create([
                    'user_id' => $recurringTodo->user_id,
                    'recurring_todo_id' => $recurringTodo->id,
                    'title' => $recurringTodo->title,
                    'note' => $recurringTodo->note,
                    'due_time' => $occurrenceDate,
                    'state' => 'pending',
                ]);

                $generatedCount++;
            }
        }

        return $generatedCount;
    }

    /**
     * Check if a todo already exists for this occurrence
     * For sub-day intervals, we use a time window to avoid duplicates
     */
    protected function checkExistingTodo(RecurringTodo $recurringTodo, Carbon $occurrenceTime): bool
    {
        $intervalUnit = $recurringTodo->interval_unit;

        // For sub-day intervals, check within a small time window
        if (\in_array($intervalUnit, ['second', 'minute', 'hour'])) {
            // Use a window based on the interval unit
            $windowSeconds = match ($intervalUnit) {
                'second' => 1,
                'minute' => 30, // 30 seconds window
                'hour' => 60, // 1 minute window
                default => 60,
            };

            return Todo::where('recurring_todo_id', $recurringTodo->id)
                ->whereBetween('due_time', [
                    $occurrenceTime->copy()->subSeconds($windowSeconds),
                    $occurrenceTime->copy()->addSeconds($windowSeconds),
                ])
                ->exists();
        }

        // For day+ intervals, check by date only
        return Todo::where('recurring_todo_id', $recurringTodo->id)
            ->whereDate('due_time', $occurrenceTime)
            ->exists();
    }

    /**
     * Calculate all occurrences within a date range using math instead of iteration
     *
     * @return Carbon[]
     */
    protected function getOccurrencesInRange(Carbon $startTime, Carbon $rangeStart, Carbon $rangeEnd, RecurringTodo $recurringTodo): array
    {
        $occurrences = [];
        $intervalSeconds = $this->getIntervalInSeconds($recurringTodo);

        // For second/minute/hour/day/week intervals, we can use simple math
        if (\in_array($recurringTodo->interval_unit, ['second', 'minute', 'hour', 'day', 'week'])) {
            // Calculate seconds from start_date to rangeStart
            $secondsSinceStart = $startTime->diffInSeconds($rangeStart, false);

            if ($secondsSinceStart < 0) {
                // rangeStart is before start_date, first occurrence is start_date
                $firstOccurrenceIndex = 0;
            } else {
                // Calculate the first occurrence index >= rangeStart
                $firstOccurrenceIndex = (int) ceil($secondsSinceStart / $intervalSeconds);
            }

            // Calculate seconds from start_date to rangeEnd
            $secondsToRangeEnd = $startTime->diffInSeconds($rangeEnd, false);
            $lastOccurrenceIndex = (int) floor($secondsToRangeEnd / $intervalSeconds);

            // Generate occurrences
            for ($i = $firstOccurrenceIndex; $i <= $lastOccurrenceIndex; $i++) {
                $occurrenceDate = $startTime->copy()->addSeconds($i * $intervalSeconds);
                if ($occurrenceDate->gte($rangeStart) && $occurrenceDate->lte($rangeEnd)) {
                    $occurrences[] = $occurrenceDate;
                }
            }
        } else {
            // For month/year intervals, iterate due to variable month lengths
            // But start from a calculated position to minimize iterations
            $firstOccurrence = $this->getFirstOccurrenceOnOrAfter($startTime, $rangeStart, $recurringTodo);

            $currentTime = $firstOccurrence;
            while ($currentTime->lte($rangeEnd)) {
                $occurrences[] = $currentTime->copy();
                $currentTime = $this->addInterval($currentTime, $recurringTodo);
            }
        }

        return $occurrences;
    }

    /**
     * Get the interval in seconds (for second/minute/hour/day/week units)
     */
    protected function getIntervalInSeconds(RecurringTodo $recurringTodo): int
    {
        return match ($recurringTodo->interval_unit) {
            'second' => $recurringTodo->interval,
            'minute' => $recurringTodo->interval * 60,
            'hour' => $recurringTodo->interval * 60 * 60,
            'day' => $recurringTodo->interval * 24 * 60 * 60,
            'week' => $recurringTodo->interval * 7 * 24 * 60 * 60,
            default => 0, // Not used for month/year
        };
    }

    /**
     * Calculate the first occurrence on or after a target date using math
     */
    protected function getFirstOccurrenceOnOrAfter(Carbon $startTime, Carbon $targetTime, RecurringTodo $recurringTodo): Carbon
    {
        if ($startTime->gte($targetTime)) {
            return $startTime->copy();
        }

        $interval = $recurringTodo->interval;

        switch ($recurringTodo->interval_unit) {
            case 'second':
                $secondsDiff = $startTime->diffInSeconds($targetTime);
                $periods = (int) ceil($secondsDiff / $interval);

                return $startTime->copy()->addSeconds($periods * $interval);

            case 'minute':
                $minutesDiff = $startTime->diffInMinutes($targetTime);
                $periods = (int) ceil($minutesDiff / $interval);

                return $startTime->copy()->addMinutes($periods * $interval);

            case 'hour':
                $hoursDiff = $startTime->diffInHours($targetTime);
                $periods = (int) ceil($hoursDiff / $interval);

                return $startTime->copy()->addHours($periods * $interval);

            case 'day':
                $daysDiff = $startTime->diffInDays($targetTime);
                $periods = (int) ceil($daysDiff / $interval);

                return $startTime->copy()->addDays($periods * $interval);

            case 'week':
                $weeksDiff = $startTime->diffInWeeks($targetTime);
                $periods = (int) ceil($weeksDiff / $interval);

                return $startTime->copy()->addWeeks($periods * $interval);

            case 'month':
                $monthsDiff = $startTime->diffInMonths($targetTime);
                $periods = (int) ceil($monthsDiff / $interval);
                $result = $startTime->copy()->addMonths($periods * $interval);
                // Adjust if we landed before target due to month-end edge cases
                while ($result->lt($targetTime)) {
                    $result->addMonths($interval);
                }

                return $result;

            case 'year':
                $yearsDiff = $startTime->diffInYears($targetTime);
                $periods = (int) ceil($yearsDiff / $interval);
                $result = $startTime->copy()->addYears($periods * $interval);
                // Adjust if we landed before target due to leap year edge cases
                while ($result->lt($targetTime)) {
                    $result->addYears($interval);
                }

                return $result;

            default:
                return $startTime->copy();
        }
    }

    /**
     * Add interval to a date
     */
    protected function addInterval(Carbon $date, RecurringTodo $recurringTodo): Carbon
    {
        $result = $date->copy();

        return match ($recurringTodo->interval_unit) {
            'second' => $result->addSeconds($recurringTodo->interval),
            'minute' => $result->addMinutes($recurringTodo->interval),
            'hour' => $result->addHours($recurringTodo->interval),
            'day' => $result->addDays($recurringTodo->interval),
            'week' => $result->addWeeks($recurringTodo->interval),
            'month' => $result->addMonths($recurringTodo->interval),
            'year' => $result->addYears($recurringTodo->interval),
            default => $result,
        };
    }
}
