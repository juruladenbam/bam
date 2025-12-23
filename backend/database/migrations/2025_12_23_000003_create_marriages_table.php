<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marriages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('husband_id')->constrained('persons');
            $table->foreignId('wife_id')->constrained('persons');
            $table->date('marriage_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->date('divorce_date')->nullable();
            $table->boolean('is_internal')->default(false); // Pernikahan sesama keluarga
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marriages');
    }
};
