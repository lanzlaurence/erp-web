<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Preference extends Model
{
    protected $fillable = ['key', 'value', 'type'];

    public static function get(string $key, $default = null)
    {
        return Cache::rememberForever("preference.{$key}", function () use ($key, $default) {
            $preference = self::where('key', $key)->first();
            return $preference ? $preference->value : $default;
        });
    }

    public static function set(string $key, $value, string $type = 'text'): void
    {
        self::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'type' => $type]
        );
        Cache::forget("preference.{$key}");
    }

    protected static function boot()
    {
        parent::boot();

        static::saved(function ($preference) {
            Cache::forget("preference.{$preference->key}");
        });

        static::deleted(function ($preference) {
            Cache::forget("preference.{$preference->key}");
        });
    }
}
