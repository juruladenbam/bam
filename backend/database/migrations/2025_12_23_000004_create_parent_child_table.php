<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parent_child', function (Blueprint $table) {
            $table->id();
            $table->foreignId('marriage_id')->constrained('marriages')->onDelete('cascade');
            $table->foreignId('child_id')->constrained('persons')->onDelete('cascade');
            $table->integer('birth_order')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parent_child');
    }
};
