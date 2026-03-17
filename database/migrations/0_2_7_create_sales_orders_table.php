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
        Schema::create('sales_orders', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('status', [
                'draft',
                'posted',
                'partially_shipped',
                'fully_shipped',
                'cancelled',
            ])->default('draft');
            $table->date('order_date');
            $table->date('delivery_date')->nullable();
            $table->string('reference_no')->nullable();
            $table->enum('discount_type', ['fixed', 'percentage'])->nullable();
            $table->decimal('discount_amount',       15, 2)->default(0);
            $table->decimal('total_before_discount', 15, 2)->default(0);
            $table->decimal('total_item_discount',   15, 2)->default(0);
            $table->decimal('total_net_price',       15, 2)->default(0);
            $table->decimal('total_vat',             15, 2)->default(0);
            $table->decimal('total_gross',           15, 2)->default(0);
            $table->decimal('total_charges',         15, 2)->default(0);
            $table->decimal('header_discount_total', 15, 2)->default(0);
            $table->decimal('grand_total',           15, 2)->default(0);
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_orders');
    }
};
