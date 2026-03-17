<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaterialLog extends Model
{
    protected $fillable = ['material_id', 'user_id', 'action', 'changes', 'remarks'];

    protected $casts = ['changes' => 'array'];

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
