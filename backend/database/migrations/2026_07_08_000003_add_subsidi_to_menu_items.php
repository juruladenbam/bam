<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('catering_menu_items', function (Blueprint $table) {
            $table->boolean('is_subsidi')->default(false)->after('cost_per_portion');
            $table->enum('serving_style', ['sendiri2', 'bareng2'])->nullable()->after('is_subsidi');
        });
    }

    public function down(): void
    {
        Schema::table('catering_menu_items', function (Blueprint $table) {
            $table->dropColumn(['is_subsidi', 'serving_style']);
        });
    }
};
