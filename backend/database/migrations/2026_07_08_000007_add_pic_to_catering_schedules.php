<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('catering_schedules', function (Blueprint $table) {
            $table->enum('pic_type', ['person', 'other'])->nullable()->after('sort_order');
            $table->unsignedBigInteger('pic_person_id')->nullable()->after('pic_type');
            $table->string('pic_name')->nullable()->after('pic_person_id');
        });
    }

    public function down(): void
    {
        Schema::table('catering_schedules', function (Blueprint $table) {
            $table->dropColumn(['pic_type', 'pic_person_id', 'pic_name']);
        });
    }
};
