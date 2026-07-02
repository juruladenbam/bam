<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if Ngaglik already exists
        $exists = DB::table('branches')->where('name', 'Ngaglik')->exists();
        if (!$exists) {
            $maxOrder = DB::table('branches')->max('order') ?? 0;
            DB::table('branches')->insert([
                'name' => 'Ngaglik',
                'order' => $maxOrder + 1,
                'description' => 'Qobilah Ngaglik',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('branches')->where('name', 'Ngaglik')->delete();
    }
};
