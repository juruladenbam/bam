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
        Schema::create('committee_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('committee_division_id')->constrained('committee_divisions')->cascadeOnDelete();
            $table->foreignId('parent_task_id')->nullable()->constrained('committee_tasks')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('status', ['todo', 'in_progress', 'done', 'blocked'])->default('todo');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->dateTime('deadline')->nullable();
            $table->foreignId('assignee_id')->nullable()->constrained('persons')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('committee_tasks');
    }
};
