<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoodsReceiptItem extends Model
{
    protected $fillable = [
        'goods_receipt_id', 'purchase_order_item_id', 'material_id',
        'qty_ordered', 'qty_received', 'qty_to_receive', 'qty_remaining',
        'unit_cost', 'serial_number', 'batch_number', 'remarks',
    ];

    protected $casts = [
        'qty_ordered'    => 'decimal:6',
        'qty_received'   => 'decimal:6',
        'qty_to_receive' => 'decimal:6',
        'qty_remaining'  => 'decimal:6',
        'unit_cost'      => 'decimal:2',
    ];

    public function goodsReceipt(): BelongsTo      { return $this->belongsTo(GoodsReceipt::class); }
    public function purchaseOrderItem(): BelongsTo  { return $this->belongsTo(PurchaseOrderItem::class); }
    public function material(): BelongsTo           { return $this->belongsTo(Material::class); }
}
