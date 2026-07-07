<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Alter users table for Juruladen NIB-based auth:
     * - email becomes nullable (NIB is the primary identifier)
     * - password becomes nullable (NULL = first-time user, not yet set password)
     *
     * We use raw ALTER TABLE to avoid Schema::table re-adding
     * unique indexes that already exist.
     */
    public function up(): void
    {
        // Make email nullable while preserving existing unique constraint
        Schema::getConnection()->statement(
            'ALTER TABLE `users` MODIFY `email` VARCHAR(255) NULL'
        );

        // Make password nullable
        Schema::getConnection()->statement(
            'ALTER TABLE `users` MODIFY `password` VARCHAR(255) NULL'
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert email to NOT NULL
        Schema::getConnection()->statement(
            'ALTER TABLE `users` MODIFY `email` VARCHAR(255) NOT NULL'
        );

        // Revert password to NOT NULL
        Schema::getConnection()->statement(
            'ALTER TABLE `users` MODIFY `password` VARCHAR(255) NOT NULL'
        );
    }
};
