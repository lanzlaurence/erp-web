<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Material extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'description',
        'weight',
        'length',
        'width',
        'height',
        'volume',
        'min_stock_level',
        'max_stock_level',
        'reorder_level',
        'unit_cost',
        'unit_price',
        'status',
        'track_serial_number',
        'track_batch_number',
        'brand_id',
        'category_id',
        'uom_id',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
        'length' => 'decimal:2',
        'width' => 'decimal:2',
        'height' => 'decimal:2',
        'volume' => 'decimal:2',
        'min_stock_level' => 'integer',
        'max_stock_level' => 'integer',
        'reorder_level' => 'integer',
        'unit_cost' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'track_serial_number' => 'boolean',
        'track_batch_number' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($material) {
            if (empty($material->code)) {
                $material->code = self::generateNextCode();
            }
        });
    }

    private static function generateNextCode(): string
    {
        $lastMaterial = self::withTrashed()
            ->where('code', 'like', '3%')
            ->orderBy('code', 'desc')
            ->first();

        if (!$lastMaterial) {
            return '300001';
        }

        $lastNumber = (int) substr($lastMaterial->code, 1);
        $nextNumber = $lastNumber + 1;

        return '3' . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function uom(): BelongsTo
    {
        return $this->belongsTo(Uom::class);
    }
}
