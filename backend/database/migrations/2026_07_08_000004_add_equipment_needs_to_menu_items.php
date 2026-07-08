<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('catering_menu_items', function (Blueprint $table) {
            $table->json('equipment_needs')->nullable()->after('serving_style');
        });
    }

    public function down(): void
    {
        Schema::table('catering_menu_items', function (Blueprint $table) {
            $table->dropColumn('equipment_needs');
        });
    }
};
