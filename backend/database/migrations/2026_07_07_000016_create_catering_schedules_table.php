<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('catering_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->time('time_serve');
            $table->enum('meal_type', ['ringan', 'berat', 'snack', 'minuman'])->default('berat');
            $table->string('menu_name');
            $table->integer('portion_count')->default(1);
            $table->enum('source', ['masak_sendiri', 'catering', 'nasi_kotak'])->default('masak_sendiri');
            $table->string('vendor_name')->nullable();
            $table->decimal('cost_per_portion', 12, 2)->nullable();
            $table->text('dietary_notes')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catering_schedules');
    }
};
