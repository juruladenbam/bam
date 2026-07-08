<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('catering_menu_items', function (Blueprint $table) {
            $table->enum('subsidi_source_type', ['person', 'qobilah', 'other'])->nullable()->after('is_subsidi');
            $table->unsignedBigInteger('subsidi_source_id')->nullable()->after('subsidi_source_type');
            $table->string('subsidi_source_name')->nullable()->after('subsidi_source_id');
        });
    }

    public function down(): void
    {
        Schema::table('catering_menu_items', function (Blueprint $table) {
            $table->dropColumn(['subsidi_source_type', 'subsidi_source_id', 'subsidi_source_name']);
        });
    }
};
