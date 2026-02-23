<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class GoodsIssue extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code', 'sales_order_id', 'user_id',
        'location_id', 'status', 'gi_date',
        'transaction_date', 'remarks',
    ];

    protected $casts = [
        'gi_date'          => 'date',
        'transaction_date' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($gi) {
            if (empty($gi->code)) $gi->code = self::generateCode();
        });
    }

    public static function generateCode(): string
    {
        $prefix = 'GI-2' . now()->format('ym');
        $last = self::withTrashed()->where('code', 'like', $prefix . '%')->orderBy('id', 'desc')->first();
        $next = $last ? ((int) substr($last->code, -4)) + 1 : 1;
        return $prefix . str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    public function salesOrder(): BelongsTo { return $this->belongsTo(SalesOrder::class); }
    public function user(): BelongsTo       { return $this->belongsTo(User::class); }
    public function location(): BelongsTo   { return $this->belongsTo(Location::class); }
    public function items(): HasMany        { return $this->hasMany(GoodsIssueItem::class); }
    public function logs(): MorphMany       { return $this->morphMany(TransactionLog::class, 'loggable'); }

    public function canBeEdited(): bool    { return $this->status === 'pending'; }
    public function canBeDeleted(): bool   { return $this->status === 'pending'; }
    public function canBeCompleted(): bool { return $this->status === 'pending'; }
    public function canBeCancelled(): bool { return in_array($this->status, ['pending', 'completed']); }
    public function canBeReverted(): bool
    {
        if ($this->status !== 'cancelled') return false;
        return $this->salesOrder?->status !== 'cancelled';
    }
}
