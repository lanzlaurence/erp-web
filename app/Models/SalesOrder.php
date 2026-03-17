<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalesOrder extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code', 'customer_id', 'user_id', 'status',
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
        static::creating(function ($so) {
            if (empty($so->code)) $so->code = self::generateCode();
        });
    }

    public static function generateCode(): string
    {
        $prefix = 'SO-1' . now()->format('ym');
        $last = self::withTrashed()->where('code', 'like', $prefix . '%')->orderBy('id', 'desc')->first();
        $next = $last ? ((int) substr($last->code, -4)) + 1 : 1;
        return $prefix . str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    public function customer(): BelongsTo  { return $this->belongsTo(Customer::class); }
    public function user(): BelongsTo      { return $this->belongsTo(User::class); }
    public function items(): HasMany       { return $this->hasMany(SalesOrderItem::class); }
    public function charges(): HasMany     { return $this->hasMany(SalesOrderCharge::class); }
    public function goodsIssues(): HasMany { return $this->hasMany(GoodsIssue::class); }
    public function logs(): MorphMany      { return $this->morphMany(TransactionLog::class, 'loggable'); }

    public function canBeEdited(): bool   { return $this->status === 'draft'; }
    public function canBePosted(): bool   { return $this->status === 'draft'; }
    public function canBeReverted(): bool { return $this->status === 'posted'; }
    public function canCreateGi(): bool   { return in_array($this->status, ['posted', 'partially_shipped']); }

    public function canBeCancelled(): bool
    {
        return $this->status !== 'cancelled';
    }
}
