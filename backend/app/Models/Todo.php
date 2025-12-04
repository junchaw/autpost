<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Todo extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'recurring_todo_id',
        'title',
        'note',
        'due_time',
        'is_whole_day',
        'state',
    ];

    protected function casts(): array
    {
        return [
            'due_time' => 'datetime',
            'is_whole_day' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function recurringTodo(): BelongsTo
    {
        return $this->belongsTo(RecurringTodo::class);
    }

    public function isPending(): bool
    {
        return $this->state === 'pending';
    }

    public function isInProgress(): bool
    {
        return $this->state === 'in_progress';
    }

    public function isCompleted(): bool
    {
        return $this->state === 'completed';
    }

    public function isCancelled(): bool
    {
        return $this->state === 'cancelled';
    }
}
