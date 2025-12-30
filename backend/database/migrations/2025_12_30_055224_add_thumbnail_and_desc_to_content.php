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
        Schema::table('news_posts', function (Blueprint $table) {
            $table->string('thumbnail')->nullable()->after('title');
            $table->text('description')->nullable()->after('title'); // Short excerpt
        });

        Schema::table('events', function (Blueprint $table) {
            $table->string('thumbnail')->nullable()->after('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('news_posts', function (Blueprint $table) {
            $table->dropColumn(['thumbnail', 'description']);
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['thumbnail']);
        });
    }
};
