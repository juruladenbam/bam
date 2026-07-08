<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create menu items table
        Schema::create('catering_menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('catering_schedule_id')->constrained('catering_schedules')->cascadeOnDelete();
            $table->enum('menu_category', ['makanan_berat', 'makanan_ringan', 'minuman_es', 'minuman_hangat', 'snack']);
            $table->string('menu_name');
            $table->integer('portion_count')->default(1);
            $table->decimal('cost_per_portion', 12, 2)->nullable();
            $table->text('notes')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 2. Remove menu-specific columns from schedules
        Schema::table('catering_schedules', function (Blueprint $table) {
            $table->dropColumn(['menu_category', 'menu_name', 'portion_count', 'source', 'vendor_name', 'cost_per_portion', 'dietary_notes']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catering_menu_items');

        Schema::table('catering_schedules', function (Blueprint $table) {
            $table->string('menu_category')->nullable();
            $table->string('menu_name')->nullable();
            $table->integer('portion_count')->default(1);
            $table->string('source')->nullable();
            $table->string('vendor_name')->nullable();
            $table->decimal('cost_per_portion', 12, 2)->nullable();
            $table->text('dietary_notes')->nullable();
        });
    }
};
