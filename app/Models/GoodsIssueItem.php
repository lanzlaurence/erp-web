<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoodsIssueItem extends Model
{
    protected $fillable = [
        'goods_issue_id', 'sales_order_item_id', 'material_id',
        'qty_ordered', 'qty_shipped', 'qty_to_ship', 'qty_remaining',
        'unit_price', 'serial_number', 'batch_number', 'remarks',
    ];

    protected $casts = [
        'qty_ordered'   => 'decimal:6',
        'qty_shipped'    => 'decimal:6',
        'qty_to_ship'  => 'decimal:6',
        'qty_remaining' => 'decimal:6',
        'unit_price'    => 'decimal:2',
    ];

    public function goodsIssue(): BelongsTo      { return $this->belongsTo(GoodsIssue::class); }
    public function salesOrderItem(): BelongsTo  { return $this->belongsTo(SalesOrderItem::class); }
    public function material(): BelongsTo        { return $this->belongsTo(Material::class); }
}
