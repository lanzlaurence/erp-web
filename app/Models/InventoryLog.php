<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryLog extends Model
{
    protected $fillable = [
        'movement_code',
        'inventory_id',
        'material_id',
        'location_id',
        'user_id',
        'type',
        'quantity_before',
        'quantity_change',
        'quantity_after',
        'transfer_to_location_id',
        'reference_id',
        'reference_type',
        'remarks',
    ];

    protected $casts = [
        'quantity_before' => 'decimal:2',
        'quantity_change' => 'decimal:2',
        'quantity_after'  => 'decimal:2',
    ];

    public static function generateMovementCode(): string
    {
        $yy = now()->format('y');   // 26
        $mm = now()->format('m');   // 01

        $prefix = '5' . $yy . $mm; // 52601

        $last = self::where('movement_code', 'like', $prefix . '%')
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = $last
            ? ((int) substr($last->movement_code, -4)) + 1
            : 1;

        return $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    public function inventory()
    {
        return $this->belongsTo(Inventory::class)->withTrashed();
    }

    public function material()
    {
        return $this->belongsTo(Material::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transferToLocation()
    {
        return $this->belongsTo(Location::class, 'transfer_to_location_id');
    }

    public function reference()
    {
        return $this->morphTo();
    }
}
