<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration:
     * 1. Makes branch_id nullable
     * 2. Adds is_root field to persons table
     * 3. Sets Abdul Manan Ali as root (is_root = true, branch_id = null)
     * 4. Migrates "Pasangan Luar" members to branch_id = null
     * 5. Deletes the "Pasangan Luar" branch
     */
    public function up(): void
    {
        // Step 1: Make branch_id nullable
        Schema::table('persons', function (Blueprint $table) {
            $table->unsignedBigInteger('branch_id')->nullable()->change();
        });

        // Step 2: Add is_root field
        Schema::table('persons', function (Blueprint $table) {
            $table->boolean('is_root')->default(false)->after('is_alive');
        });

        // Step 3: Set Abdul Manan Ali as root (id = 34)
        DB::table('persons')
            ->where('id', 34)
            ->update([
                'is_root' => true,
                'branch_id' => null,
            ]);

        // Step 4: Find "Pasangan Luar" branch (order = 99 or id = 24)
        $pasanganLuarBranch = DB::table('branches')
            ->where('order', 99)
            ->first();

        if ($pasanganLuarBranch) {
            // Migrate all persons from Pasangan Luar to branch_id = null
            DB::table('persons')
                ->where('branch_id', $pasanganLuarBranch->id)
                ->update(['branch_id' => null]);

            // Step 5: Delete the Pasangan Luar branch
            DB::table('branches')
                ->where('id', $pasanganLuarBranch->id)
                ->delete();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate "Pasangan Luar" branch
        $branchId = DB::table('branches')->insertGetId([
            'name' => 'Pasangan Luar',
            'order' => 99,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Move persons with branch_id = null (except root) back to Pasangan Luar
        DB::table('persons')
            ->whereNull('branch_id')
            ->where('is_root', false)
            ->update(['branch_id' => $branchId]);

        // Move Abdul Manan back to Pasangan Luar (for rollback consistency)
        DB::table('persons')
            ->where('id', 34)
            ->update([
                'branch_id' => $branchId,
                'is_root' => false,
            ]);

        // Remove is_root column
        Schema::table('persons', function (Blueprint $table) {
            $table->dropColumn('is_root');
        });

        // Make branch_id NOT NULL again
        Schema::table('persons', function (Blueprint $table) {
            $table->unsignedBigInteger('branch_id')->nullable(false)->change();
        });
    }
};
