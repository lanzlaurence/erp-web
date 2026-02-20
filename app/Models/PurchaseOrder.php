<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseOrder extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code', 'po_number', 'vendor_id', 'user_id', 'status',
        'order_date', 'delivery_date', 'reference_no',
        'discount_type', 'discount_amount',
        'total_before_discount', 'total_item_discount',
        'total_net_price', 'total_vat', 'total_gross',
        'total_charges', 'header_discount_total', 'grand_total',
        'remarks',
    ];

    protected $casts = [
        'order_date'            => 'date',
        'delivery_date'         => 'date',
        'discount_amount'       => 'decimal:2',
        'total_before_discount' => 'decimal:2',
        'total_item_discount'   => 'decimal:2',
        'total_net_price'       => 'decimal:2',
        'total_vat'             => 'decimal:2',
        'total_gross'           => 'decimal:2',
        'total_charges'         => 'decimal:2',
        'header_discount_total' => 'decimal:2',
        'grand_total'           => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($po) {
            if (empty($po->po_number)) {
                $po->po_number = self::generatePoNumber();
            }
            if (empty($po->code)) {
                $po->code = self::generateCode();
            }
        });
    }

    public static function generateCode(): string
    {
        $yymm   = now()->format('ym'); // e.g. 2601
        $prefix = '2' . $yymm;        // e.g. 22601

        $last = self::withTrashed()
            ->where('code', 'like', $prefix . '%')
            ->orderBy('id', 'desc')
            ->first();

        $next = $last ? ((int) substr($last->code, -4)) + 1 : 1;

        return $prefix . str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    public static function generatePoNumber(): string
    {
        $prefix = 'PO-' . now()->format('Ym');
        $last   = self::withTrashed()
            ->where('po_number', 'like', $prefix . '%')
            ->orderBy('id', 'desc')->first();
        $next   = $last ? ((int) substr($last->po_number, -4)) + 1 : 1;
        return $prefix . str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    public function vendor(): BelongsTo     { return $this->belongsTo(Vendor::class); }
    public function user(): BelongsTo       { return $this->belongsTo(User::class); }
    public function items(): HasMany        { return $this->hasMany(PurchaseOrderItem::class); }
    public function charges(): HasMany      { return $this->hasMany(PurchaseOrderCharge::class); }
    public function goodsReceipts(): HasMany { return $this->hasMany(GoodsReceipt::class); }
    public function logs(): MorphMany       { return $this->morphMany(TransactionLog::class, 'loggable'); }

    public function canBeEdited(): bool     { return $this->status === 'draft'; }
    public function canBePosted(): bool     { return $this->status === 'draft'; }
    public function canBeCancelled(): bool  { return in_array($this->status, ['draft', 'posted', 'partially_received']); }
    public function canCreateGr(): bool     { return in_array($this->status, ['posted', 'partially_received']); }
}
