<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            ['name' => 'Samsung', 'description' => 'South Korean multinational conglomerate'],
            ['name' => 'Apple', 'description' => 'American technology company'],
            ['name' => 'Sony', 'description' => 'Japanese multinational conglomerate'],
            ['name' => 'LG', 'description' => 'South Korean multinational electronics company'],
            ['name' => 'Dell', 'description' => 'American computer technology company'],
            ['name' => 'HP', 'description' => 'American multinational information technology company'],
            ['name' => 'Lenovo', 'description' => 'Chinese multinational technology company'],
            ['name' => 'Asus', 'description' => 'Taiwanese multinational computer hardware company'],
            ['name' => 'Acer', 'description' => 'Taiwanese multinational hardware company'],
            ['name' => 'Microsoft', 'description' => 'American multinational technology corporation'],
            ['name' => 'Huawei', 'description' => 'Chinese multinational technology corporation'],
            ['name' => 'Xiaomi', 'description' => 'Chinese electronics company'],
            ['name' => 'Canon', 'description' => 'Japanese multinational corporation'],
            ['name' => 'Nikon', 'description' => 'Japanese multinational corporation'],
            ['name' => 'Panasonic', 'description' => 'Japanese multinational electronics corporation'],
        ];

        foreach ($brands as $brand) {
            Brand::create($brand);
        }
    }
}
