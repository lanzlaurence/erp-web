<?php

namespace Database\Seeders;

use App\Models\Uom;
use Illuminate\Database\Seeder;

class UomSeeder extends Seeder
{
    public function run(): void
    {
        $uoms = [
            ['acronym' => 'PC', 'description' => 'Piece'],
            ['acronym' => 'SET', 'description' => 'Set'],
            ['acronym' => 'BOX', 'description' => 'Box'],
            ['acronym' => 'PKG', 'description' => 'Package'],
            ['acronym' => 'KG', 'description' => 'Kilogram'],
            ['acronym' => 'G', 'description' => 'Gram'],
            ['acronym' => 'L', 'description' => 'Liter'],
            ['acronym' => 'ML', 'description' => 'Milliliter'],
            ['acronym' => 'M', 'description' => 'Meter'],
            ['acronym' => 'CM', 'description' => 'Centimeter'],
            ['acronym' => 'FT', 'description' => 'Feet'],
            ['acronym' => 'IN', 'description' => 'Inch'],
            ['acronym' => 'DOZ', 'description' => 'Dozen'],
            ['acronym' => 'PAL', 'description' => 'Pallet'],
            ['acronym' => 'CTN', 'description' => 'Carton'],
        ];

        foreach ($uoms as $uom) {
            Uom::create($uom);
        }
    }
}
