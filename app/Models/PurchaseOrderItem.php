<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrderItem extends Model
{
    protected $fillable = [
        'purchase_order_id', 'material_id', 'line_number',
        'qty_ordered', 'qty_received',
        'unit_cost', 'discount_type', 'discount_amount',
        'unit_cost_after_discount', 'net_price',
        'is_vatable', 'vat_type', 'vat_rate', 'vat_price',
        'gross_price', 'remarks',
    ];

    protected $casts = [
        'qty_ordered'               => 'decimal:6',
        'qty_received'              => 'decimal:6',
        'unit_cost'                => 'decimal:2',
        'discount_amount'           => 'decimal:2',
        'unit_cost_after_discount' => 'decimal:2',
        'net_price'                 => 'decimal:2',
        'is_vatable'                => 'boolean',
        'vat_rate'                  => 'decimal:2',
        'vat_price'                 => 'decimal:2',
        'gross_price'               => 'decimal:2',
    ];

    public function purchaseOrder(): BelongsTo  { return $this->belongsTo(PurchaseOrder::class); }
    public function material(): BelongsTo       { return $this->belongsTo(Material::class); }
    public function goodsReceiptItems(): HasMany { return $this->hasMany(GoodsReceiptItem::class); }

    public function getQtyRemainingAttribute(): float
    {
        return (float) $this->qty_ordered - (float) $this->qty_received;
    }
}
