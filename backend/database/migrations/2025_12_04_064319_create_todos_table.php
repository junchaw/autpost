<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('todos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('recurring_todo_id')->nullable()->constrained()->onDelete('set null');
            $table->string('title');
            $table->text('note')->nullable();
            $table->dateTime('due_time')->nullable();
            $table->boolean('is_whole_day')->default(false);
            $table->enum('state', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'state']);
            $table->index(['user_id', 'due_time']);
            $table->index('recurring_todo_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('todos');
    }
};
