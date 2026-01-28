<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'country',
        'state_province',
        'suburb_barangay',
        'city',
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

        static::creating(function ($customer) {
            if (empty($customer->code)) {
                $customer->code = self::generateNextCode();
            }
        });
    }

    private static function generateNextCode(): string
    {
        $lastCustomer = self::withTrashed()
            ->where('code', 'like', '1%')
            ->orderBy('code', 'desc')
            ->first();

        if (!$lastCustomer) {
            return '100001';
        }

        $lastNumber = (int) substr($lastCustomer->code, 1);
        $nextNumber = $lastNumber + 1;

        return '1' . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
    }
}
