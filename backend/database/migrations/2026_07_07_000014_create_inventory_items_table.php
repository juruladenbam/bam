<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_category_id')->constrained('inventory_categories')->cascadeOnDelete();
            $table->string('name');
            $table->integer('quantity_needed')->default(1);
            $table->string('unit')->default('unit'); // unit, pcs, set, box, etc.
            $table->enum('source_type', ['beli', 'sewa', 'pinjam', 'punya_sendiri'])->default('beli');
            $table->string('source_detail')->nullable(); // Toko/vendor/pemilik
            $table->decimal('cost_per_unit', 12, 2)->nullable();
            $table->foreignId('assigned_to_person_id')->nullable()->constrained('persons')->nullOnDelete();
            $table->enum('acquisition_status', ['pending', 'delivered', 'returned'])->default('pending');
            $table->enum('return_status', ['not_applicable', 'pending', 'returned'])->default('not_applicable');
            $table->text('notes')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
