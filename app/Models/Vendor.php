<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vendor extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'country',
        'state_province',
        'city',
        'suburb_barangay',
        'postal_code',
        'address_line_1',
        'address_line_2',
        'payment_terms',
        'contact_persons',
        'credit_amount',
        'status',
    ];

    protected $casts = [
        'contact_persons' => 'array',
        'credit_amount' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($vendor) {
            if (empty($vendor->code)) {
                $vendor->code = self::generateNextCode();
            }
        });
    }

    private static function generateNextCode(): string
    {
        $lastVendor = self::withTrashed()
            ->where('code', 'like', '2%')
            ->orderBy('code', 'desc')
            ->first();

        if (!$lastVendor) {
            return '200001';
        }

        $lastNumber = (int) substr($lastVendor->code, 1);
        $nextNumber = $lastNumber + 1;

        return '2' . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
    }
}
