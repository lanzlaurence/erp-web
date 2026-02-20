<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderCharge extends Model
{
    protected $fillable = [
        'purchase_order_id', 'charge_id', 'name',
        'type', 'value_type', 'value', 'computed_amount',
    ];

    protected $casts = [
        'value'           => 'decimal:2',
        'computed_amount' => 'decimal:2',
    ];

    public function purchaseOrder(): BelongsTo { return $this->belongsTo(PurchaseOrder::class); }
    public function charge(): BelongsTo        { return $this->belongsTo(Charge::class); }
}
