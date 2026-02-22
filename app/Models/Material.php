<?php

namespace App\Models;

use App\Traits\HasEntityLog;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Material extends Model
{
    use HasFactory, SoftDeletes, HasEntityLog;

    protected $fillable = [
        'code', 'sku', 'name', 'description',
        'weight', 'length', 'width', 'height', 'volume',
        'min_stock_level', 'max_stock_level', 'reorder_level',
        'unit_cost', 'unit_price',
        'avg_unit_cost', 'avg_unit_price',
        'status', 'track_serial_number', 'track_batch_number',
        'brand_id', 'category_id', 'uom_id',
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
        'avg_unit_cost' => 'decimal:2',
        'avg_unit_price' => 'decimal:2',
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
            // seed avg with same value as unit cost/price
            if (empty($material->avg_unit_cost)) {
                $material->avg_unit_cost = $material->unit_cost;
            }
            if (empty($material->avg_unit_price)) {
                $material->avg_unit_price = $material->unit_price;
            }
        });
    }

    private static function generateNextCode(): string
    {
        $last = self::withTrashed()->where('code', 'like', '3%')->orderBy('code', 'desc')->first();
        if (!$last) return '300001';
        return '3' . str_pad((int) substr($last->code, 1) + 1, 5, '0', STR_PAD_LEFT);
    }

    public function brand(): BelongsTo { return $this->belongsTo(Brand::class); }
    public function category(): BelongsTo { return $this->belongsTo(Category::class); }
    public function uom(): BelongsTo { return $this->belongsTo(Uom::class); }
    public function logs(): HasMany { return $this->hasMany(MaterialLog::class); }

    public function recalculateAvgUnitCost(): void
    {
        $grItems = GoodsReceiptItem::whereHas('goodsReceipt', function ($q) {
                $q->where('status', 'completed');
            })
            ->where('material_id', $this->id)
            ->get();

        if ($grItems->isEmpty()) return;

        $totalQty   = $grItems->sum(fn($i) => (float) $i->qty_to_receive);
        $totalValue = $grItems->sum(fn($i) => (float) $i->qty_to_receive * (float) $i->unit_cost);

        if ($totalQty <= 0) return;

        $avgCost = $totalValue / $totalQty;

        Material::where('id', $this->id)->update([
            'avg_unit_cost' => round($avgCost, 2),
        ]);
    }
}
