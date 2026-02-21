<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorLog extends Model
{
    protected $fillable = ['vendor_id', 'user_id', 'action', 'changes', 'remarks'];

    protected $casts = ['changes' => 'array'];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
