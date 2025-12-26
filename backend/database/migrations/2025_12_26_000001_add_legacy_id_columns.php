<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add legacy_id to persons for CSV import mapping
        Schema::table('persons', function (Blueprint $table) {
            $table->string('legacy_id', 20)->nullable()->unique()->after('id');
        });

        // Add legacy_id to marriages for CSV import mapping
        Schema::table('marriages', function (Blueprint $table) {
            $table->string('legacy_id', 20)->nullable()->unique()->after('id');
        });
    }

    public function down(): void
    {
        Schema::table('persons', function (Blueprint $table) {
            $table->dropColumn('legacy_id');
        });

        Schema::table('marriages', function (Blueprint $table) {
            $table->dropColumn('legacy_id');
        });
    }
};
