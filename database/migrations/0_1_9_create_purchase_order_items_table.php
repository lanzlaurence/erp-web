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
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('material_id')->constrained()->cascadeOnDelete();
            $table->integer('line_number');
            $table->decimal('qty_ordered',             15, 6)->default(0);
            $table->decimal('qty_received',            15, 6)->default(0);
            $table->decimal('unit_price',              15, 2)->default(0);
            $table->enum('discount_type', ['fixed', 'percentage'])->nullable();
            $table->decimal('discount_amount',         15, 2)->default(0);
            $table->decimal('unit_price_after_discount', 15, 2)->default(0);
            $table->decimal('net_price',               15, 2)->default(0);
            $table->boolean('is_vatable')->default(false);
            $table->enum('vat_type', ['exclusive', 'inclusive'])->nullable();
            $table->decimal('vat_rate',  5, 2)->default(12.00);
            $table->decimal('vat_price', 15, 2)->default(0);
            $table->decimal('gross_price', 15, 2)->default(0);
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_order_items');
    }
};
