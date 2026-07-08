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
        Schema::table('events', function (Blueprint $table) {
            $table->boolean('is_juruladen_active')->default(false)->after('is_active');
            $table->decimal('budget_total', 15, 2)->nullable()->after('is_juruladen_active');
            $table->enum('budget_status', ['draft', 'approved', 'closed'])->default('draft')->after('budget_total');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['is_juruladen_active', 'budget_total', 'budget_status']);
        });
    }
};
