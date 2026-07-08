<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('catering_schedules', function (Blueprint $table) {
            $table->foreignId('rundown_item_id')->nullable()->after('event_id')
                ->constrained('rundown_items')->nullOnDelete();
            $table->enum('menu_category', ['makanan', 'minuman_es', 'minuman_hangat', 'snack'])
                ->nullable()->after('meal_type');
            // Make meal_type nullable — replaced by menu_category
            $table->string('meal_type')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('catering_schedules', function (Blueprint $table) {
            $table->dropForeign(['rundown_item_id']);
            $table->dropColumn(['rundown_item_id', 'menu_category']);
        });
    }
};
