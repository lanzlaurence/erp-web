<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Electronics', 'description' => 'Electronic devices and gadgets'],
            ['name' => 'Computers', 'description' => 'Desktop and laptop computers'],
            ['name' => 'Mobile Phones', 'description' => 'Smartphones and mobile devices'],
            ['name' => 'Tablets', 'description' => 'Tablet devices and accessories'],
            ['name' => 'Cameras', 'description' => 'Digital cameras and equipment'],
            ['name' => 'Audio', 'description' => 'Audio equipment and speakers'],
            ['name' => 'Television', 'description' => 'TVs and display monitors'],
            ['name' => 'Gaming', 'description' => 'Gaming consoles and accessories'],
            ['name' => 'Wearables', 'description' => 'Smartwatches and fitness trackers'],
            ['name' => 'Networking', 'description' => 'Routers and networking equipment'],
            ['name' => 'Storage', 'description' => 'Hard drives and storage devices'],
            ['name' => 'Printers', 'description' => 'Printers and scanners'],
            ['name' => 'Accessories', 'description' => 'Various tech accessories'],
            ['name' => 'Smart Home', 'description' => 'Smart home devices and automation'],
            ['name' => 'Office Equipment', 'description' => 'Office electronics and supplies'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
