<?php

namespace App\Services;

use App\Models\RecurringTodo;
use App\Models\Todo;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class RecurringTodoService
{
    /**
     * Generate todos from recurring todos and return the count
     *
     * @param  string  $timeAhead  Time ahead to generate todos for (e.g., "1h", "2d", "1w")
     * @return int Number of todos generated
     */
    public function generate(string $timeAhead = '7d'): int
    {
        $now = Carbon::now();
        $secondsAhead = $this->parseTimeAhead($timeAhead);
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

        Log::info("RecurringTodoService::generate completed. Generated {$generatedCount} todos for timeAhead={$timeAhead}.");

        return $generatedCount;
    }

    /**
     * Parse the timeAhead string into seconds
     */
    protected function parseTimeAhead(string $timeAhead): int
    {
        if (! preg_match('/^(\d+)([smhdw])$/', strtolower($timeAhead), $matches)) {
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
     * Generate todos for a single recurring todo
     */
    protected function generateTodosForRecurring(RecurringTodo $recurringTodo, Carbon $startRange, Carbon $endRange): int
    {
        $generatedCount = 0;
        $startTime = Carbon::parse($recurringTodo->start_time);

        $occurrences = $this->getOccurrencesInRange($startTime, $startRange, $endRange, $recurringTodo);

        foreach ($occurrences as $occurrenceDate) {
            if ($recurringTodo->end_time && $occurrenceDate->gt($recurringTodo->end_time)) {
                continue;
            }

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
     */
    protected function checkExistingTodo(RecurringTodo $recurringTodo, Carbon $occurrenceTime): bool
    {
        $intervalUnit = $recurringTodo->interval_unit;

        if (\in_array($intervalUnit, ['minute', 'hour'])) {
            $windowSeconds = match ($intervalUnit) {
                'minute' => 30,
                'hour' => 60,
                default => 60,
            };

            return Todo::where('recurring_todo_id', $recurringTodo->id)
                ->whereBetween('due_time', [
                    $occurrenceTime->copy()->subSeconds($windowSeconds),
                    $occurrenceTime->copy()->addSeconds($windowSeconds),
                ])
                ->exists();
        }

        return Todo::where('recurring_todo_id', $recurringTodo->id)
            ->whereDate('due_time', $occurrenceTime)
            ->exists();
    }

    /**
     * Calculate all occurrences within a date range
     *
     * @return Carbon[]
     */
    protected function getOccurrencesInRange(Carbon $startTime, Carbon $rangeStart, Carbon $rangeEnd, RecurringTodo $recurringTodo): array
    {
        $occurrences = [];
        $intervalSeconds = $this->getIntervalInSeconds($recurringTodo);

        if (\in_array($recurringTodo->interval_unit, ['second', 'minute', 'hour', 'day', 'week'])) {
            $secondsSinceStart = $startTime->diffInSeconds($rangeStart, false);

            if ($secondsSinceStart < 0) {
                $firstOccurrenceIndex = 0;
            } else {
                $firstOccurrenceIndex = (int) ceil($secondsSinceStart / $intervalSeconds);
            }

            $secondsToRangeEnd = $startTime->diffInSeconds($rangeEnd, false);
            $lastOccurrenceIndex = (int) floor($secondsToRangeEnd / $intervalSeconds);

            for ($i = $firstOccurrenceIndex; $i <= $lastOccurrenceIndex; $i++) {
                $occurrenceDate = $startTime->copy()->addSeconds($i * $intervalSeconds);
                if ($occurrenceDate->gte($rangeStart) && $occurrenceDate->lte($rangeEnd)) {
                    $occurrences[] = $occurrenceDate;
                }
            }
        } else {
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
     * Get the interval in seconds
     */
    protected function getIntervalInSeconds(RecurringTodo $recurringTodo): int
    {
        return match ($recurringTodo->interval_unit) {
            'second' => $recurringTodo->interval,
            'minute' => $recurringTodo->interval * 60,
            'hour' => $recurringTodo->interval * 60 * 60,
            'day' => $recurringTodo->interval * 24 * 60 * 60,
            'week' => $recurringTodo->interval * 7 * 24 * 60 * 60,
            default => 0,
        };
    }

    /**
     * Calculate the first occurrence on or after a target date
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
                while ($result->lt($targetTime)) {
                    $result->addMonths($interval);
                }

                return $result;

            case 'year':
                $yearsDiff = $startTime->diffInYears($targetTime);
                $periods = (int) ceil($yearsDiff / $interval);
                $result = $startTime->copy()->addYears($periods * $interval);
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
