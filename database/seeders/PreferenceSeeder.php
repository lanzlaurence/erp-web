<?php

namespace Database\Seeders;

use App\Models\Preference;
use Illuminate\Database\Seeder;

class PreferenceSeeder extends Seeder
{
    public function run(): void
    {
        $preferences = [
            ['key' => 'app_name', 'value' => 'Example App', 'type' => 'text'],
            ['key' => 'app_logo', 'value' => 'favicon.png', 'type' => 'image'],
            ['key' => 'decimal_places', 'value' => '2', 'type' => 'number'],
            ['key' => 'color_theme', 'value' => 'zinc', 'type' => 'text'],
            ['key' => 'timezone', 'value' => 'Asia/Manila', 'type' => 'text'],
        ];

        foreach ($preferences as $preference) {
            Preference::updateOrCreate(
                ['key' => $preference['key']],
                $preference
            );
        }
    }
}
