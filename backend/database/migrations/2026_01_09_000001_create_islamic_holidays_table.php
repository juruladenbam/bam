<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('islamic_holidays', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_arabic')->nullable();
            $table->tinyInteger('hijri_month'); // 1-12
            $table->tinyInteger('hijri_day');   // 1-30
            $table->tinyInteger('duration_days')->default(1);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('islamic_holidays');
    }
};
