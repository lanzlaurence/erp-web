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
        Schema::create('goods_receipt_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goods_receipt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('purchase_order_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('material_id')->constrained()->cascadeOnDelete();
            $table->decimal('qty_ordered',    15, 6)->default(0);
            $table->decimal('qty_received',   15, 6)->default(0);
            $table->decimal('qty_to_receive', 15, 6)->default(0);
            $table->decimal('qty_remaining',  15, 6)->default(0);
            $table->decimal('unit_cost',      15, 2)->default(0);
            $table->string('serial_number')->nullable();
            $table->string('batch_number')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('goods_receipt_items');
    }
};
