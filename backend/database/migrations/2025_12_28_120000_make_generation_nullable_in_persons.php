<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add default value 0 to generation column for pasangan luar (external spouses)
     */
    public function up(): void
    {
        Schema::table('persons', function (Blueprint $table) {
            $table->integer('generation')->default(0)->change();
        });
    }

    public function down(): void
    {
        Schema::table('persons', function (Blueprint $table) {
            $table->integer('generation')->default(null)->change();
        });
    }
};
