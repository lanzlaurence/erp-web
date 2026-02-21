<?php

namespace App\Models;

use App\Traits\HasEntityLog;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes, HasEntityLog;

    protected $fillable = [
        'code', 'name', 'country', 'state_province', 'city',
        'suburb_barangay', 'postal_code', 'address_line_1', 'address_line_2',
        'payment_terms', 'contact_persons', 'credit_amount', 'status',
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
        $last = self::withTrashed()->where('code', 'like', '1%')->orderBy('code', 'desc')->first();
        if (!$last) return '100001';
        return '1' . str_pad((int) substr($last->code, 1) + 1, 5, '0', STR_PAD_LEFT);
    }

    public function logs(): HasMany { return $this->hasMany(CustomerLog::class); }
}
