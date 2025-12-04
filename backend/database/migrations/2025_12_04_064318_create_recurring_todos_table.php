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
        Schema::create('recurring_todos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('note')->nullable();
            $table->integer('interval')->default(1);
            $table->string('interval_unit', 20)->default('day'); // second, minute, hour, day, week, month, year
            $table->dateTime('start_time');
            $table->dateTime('end_time')->nullable();
            $table->boolean('is_whole_day')->default(false);
            $table->enum('state', ['active', 'paused'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'state']);
            $table->index(['start_time', 'end_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recurring_todos');
    }
};
