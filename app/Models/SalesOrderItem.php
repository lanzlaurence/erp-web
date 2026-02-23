<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalesOrderItem extends Model
{
    protected $fillable = [
        'sales_order_id', 'material_id', 'line_number',
        'qty_ordered', 'qty_shipped',
        'unit_price', 'discount_type', 'discount_amount',
        'unit_price_after_discount', 'net_price',
        'is_vatable', 'vat_type', 'vat_rate', 'vat_price',
        'gross_price', 'remarks',
    ];

    protected $casts = [
        'qty_ordered'               => 'decimal:6',
        'qty_shipped'                => 'decimal:6',
        'unit_price'                => 'decimal:2',
        'discount_amount'           => 'decimal:2',
        'unit_price_after_discount' => 'decimal:2',
        'net_price'                 => 'decimal:2',
        'is_vatable'                => 'boolean',
        'vat_rate'                  => 'decimal:2',
        'vat_price'                 => 'decimal:2',
        'gross_price'               => 'decimal:2',
    ];

    public function salesOrder(): BelongsTo    { return $this->belongsTo(SalesOrder::class); }
    public function material(): BelongsTo      { return $this->belongsTo(Material::class); }
    public function goodsIssueItems(): HasMany { return $this->hasMany(GoodsIssueItem::class); }

    public function getQtyRemainingAttribute(): float
    {
        return (float) $this->qty_ordered - (float) $this->qty_shipped;
    }
}
