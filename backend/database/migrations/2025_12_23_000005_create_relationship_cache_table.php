<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('relationship_cache', function (Blueprint $table) {
            $table->id();
            $table->foreignId('person_a_id')->constrained('persons');
            $table->foreignId('person_b_id')->constrained('persons');
            $table->string('relationship_label', 100);
            $table->foreignId('lca_id')->nullable()->constrained('persons');
            $table->text('path_text')->nullable();
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('relationship_cache');
    }
};
