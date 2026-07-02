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
        Schema::table('event_registrations', function (Blueprint $table) {
            // Check driver to handle SQlite differences if any, but Laravel 12 handles it nicely
            $table->foreignId('user_id')->nullable()->change();
            $table->foreignId('person_id')->nullable()->after('user_id')->constrained('persons')->nullOnDelete();
            $table->string('name')->nullable()->after('person_id');
            $table->string('email')->nullable()->after('name');
            $table->string('whatsapp', 20)->nullable()->after('email');
            $table->enum('attendance', ['hadir', 'tidak_hadir'])->nullable()->after('whatsapp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_registrations', function (Blueprint $table) {
            $table->dropForeign(['person_id']);
            $table->dropColumn(['person_id', 'name', 'email', 'whatsapp', 'attendance']);
            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
