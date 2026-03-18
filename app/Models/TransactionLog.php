<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class TransactionLog extends Model
{
    protected $fillable = [
        'user_id', 'action',
        'from_status', 'to_status',
        'remarks',
        'loggable_id', 'loggable_type',
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }

    public function loggable(): MorphTo
    {
        return $this->morphTo()->withTrashed();
    }
}
