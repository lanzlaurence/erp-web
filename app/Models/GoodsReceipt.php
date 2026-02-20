<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class GoodsReceipt extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'gr_number', 'purchase_order_id', 'user_id',
        'destination_id', 'status', 'gr_date',
        'transaction_date', 'remarks',
    ];

    protected $casts = [
        'gr_date'          => 'date',
        'transaction_date' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($gr) {
            if (empty($gr->gr_number)) {
                $gr->gr_number = self::generateGrNumber();
            }
        });
    }

    public static function generateGrNumber(): string
    {
        $prefix = 'GR-' . now()->format('Ym');
        $last   = self::withTrashed()
            ->where('gr_number', 'like', $prefix . '%')
            ->orderBy('id', 'desc')->first();
        $next   = $last ? ((int) substr($last->gr_number, -4)) + 1 : 1;
        return $prefix . str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    public function purchaseOrder(): BelongsTo { return $this->belongsTo(PurchaseOrder::class); }
    public function user(): BelongsTo          { return $this->belongsTo(User::class); }
    public function destination(): BelongsTo   { return $this->belongsTo(Destination::class); }
    public function items(): HasMany           { return $this->hasMany(GoodsReceiptItem::class); }
    public function logs(): MorphMany          { return $this->morphMany(TransactionLog::class, 'loggable'); }
}
