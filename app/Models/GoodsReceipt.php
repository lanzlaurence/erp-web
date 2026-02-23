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
        'code', 'purchase_order_id', 'user_id',
        'location_id', 'status', 'gr_date',
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
            if (empty($gr->code))      $gr->code      = self::generateCode();
        });
    }

    public static function generateCode(): string
    {
        $prefix = 'GR-4' . now()->format('ym');
        $last = self::withTrashed()->where('code', 'like', $prefix . '%')->orderBy('id', 'desc')->first();
        $next = $last ? ((int) substr($last->code, -4)) + 1 : 1;
        return $prefix . str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    public function purchaseOrder(): BelongsTo { return $this->belongsTo(PurchaseOrder::class); }
    public function user(): BelongsTo          { return $this->belongsTo(User::class); }
    public function location(): BelongsTo   { return $this->belongsTo(Location::class); }
    public function items(): HasMany           { return $this->hasMany(GoodsReceiptItem::class); }
    public function logs(): MorphMany          { return $this->morphMany(TransactionLog::class, 'loggable'); }

    // ── Permission checks ─────────────────────────────────────────────────────
    public function canBeEdited(): bool    { return $this->status === 'pending'; }
    public function canBeDeleted(): bool   { return $this->status === 'pending'; }
    public function canBeCompleted(): bool { return $this->status === 'pending'; }
    public function canBeCancelled(): bool { return in_array($this->status, ['pending', 'completed']); }
    public function canBeReverted(): bool
    {
        if ($this->status !== 'cancelled') return false;
        return $this->purchaseOrder?->status !== 'cancelled';
    }
    public function wasCompleted(): bool   { return $this->status === 'completed'; }
}
