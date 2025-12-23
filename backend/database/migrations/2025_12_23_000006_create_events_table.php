<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->enum('type', ['festival', 'halal_bihalal', 'youth_camp', 'other']);
            $table->integer('year');
            $table->datetime('start_date');
            $table->datetime('end_date');
            $table->text('description')->nullable();
            $table->string('location_name')->nullable();
            $table->string('location_maps_url', 500)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
