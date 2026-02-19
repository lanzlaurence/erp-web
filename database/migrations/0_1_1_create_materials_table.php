<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('sku')->nullable()->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('weight', 10, 2)->nullable();
            $table->decimal('length', 10, 2)->nullable();
            $table->decimal('width', 10, 2)->nullable();
            $table->decimal('height', 10, 2)->nullable();
            $table->decimal('volume', 10, 2)->nullable();
            $table->integer('min_stock_level')->default(0);
            $table->integer('max_stock_level')->default(0);
            $table->integer('reorder_level')->default(0);
            $table->decimal('unit_cost', 15, 2)->default(0);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->boolean('track_serial_number')->default(false);
            $table->boolean('track_batch_number')->default(false);
            $table->foreignId('brand_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('uom_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materials');
    }
};
