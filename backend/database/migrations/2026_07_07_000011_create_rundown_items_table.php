<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rundown_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rundown_id')->constrained('rundowns')->cascadeOnDelete();
            $table->time('time_start');
            $table->time('time_end')->nullable();
            $table->string('activity_title');
            $table->text('description')->nullable();
            $table->foreignId('pic_person_id')->nullable()->constrained('persons')->nullOnDelete();
            $table->string('location_venue')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rundown_items');
    }
};
