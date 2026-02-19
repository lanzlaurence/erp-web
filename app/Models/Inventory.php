<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Inventory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'material_id',
        'destination_id',
        'quantity',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
    ];

    public static function generateCode(): string
    {
        $last = self::withTrashed()
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = $last ? ((int) substr($last->code, 4)) + 1 : 1;

        return 'INV-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }

    public function material()
    {
        return $this->belongsTo(Material::class);
    }

    public function destination()
    {
        return $this->belongsTo(Destination::class);
    }

    public function logs()
    {
        return $this->hasMany(InventoryLog::class);
    }
}
