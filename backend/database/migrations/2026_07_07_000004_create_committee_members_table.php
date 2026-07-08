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
        Schema::create('committee_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('committee_division_id')->constrained('committee_divisions')->cascadeOnDelete();
            $table->foreignId('person_id')->constrained('persons')->cascadeOnDelete();
            $table->enum('role', ['ketua', 'anggota'])->default('anggota');
            $table->text('responsibilities')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['committee_division_id', 'person_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('committee_members');
    }
};
