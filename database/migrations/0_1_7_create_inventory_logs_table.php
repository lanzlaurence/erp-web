<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_logs', function (Blueprint $table) {
            $table->id();
            $table->string('movement_code')->unique();
            $table->foreignId('inventory_id')->constrained()->cascadeOnDelete();
            $table->foreignId('material_id')->constrained()->cascadeOnDelete();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', [
                // Inventory module
                'initial',
                'adjustment',
                'transfer_in',
                'transfer_out',

                // Purchase Order module
                'purchase_receipt', // stock in from PO receiving
                'purchase_return', // stock out returned to vendor

                // Sales Order module
                'sales_issue', // stock out for sales delivery
                'sales_return', // stock in returned from customer
            ]);
            $table->decimal('quantity_before', 15, 2)->default(0);
            $table->decimal('quantity_change', 15, 2)->default(0);
            $table->decimal('quantity_after', 15, 2)->default(0);
            $table->foreignId('transfer_to_location_id')
                ->nullable()
                ->constrained('locations')
                ->nullOnDelete(); // only for transfer
            $table->nullableMorphs('reference'); // creates reference_id (unsignedBigInteger) + reference_type (string) both nullable
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_logs');
    }
};
