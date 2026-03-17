<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $locations = [
            ['code' => 'WH-MNL', 'name' => 'Manila Warehouse', 'description' => 'Main warehouse in Manila'],
            ['code' => 'WH-CEB', 'name' => 'Cebu Warehouse', 'description' => 'Distribution center in Cebu'],
            ['code' => 'WH-DAV', 'name' => 'Davao Warehouse', 'description' => 'Regional warehouse in Davao'],
            ['code' => 'ST-BGC', 'name' => 'BGC Store', 'description' => 'Retail store in Bonifacio Global City'],
            ['code' => 'ST-MAK', 'name' => 'Makati Store', 'description' => 'Retail store in Makati'],
            ['code' => 'ST-QC', 'name' => 'Quezon City Store', 'description' => 'Retail store in Quezon City'],
            ['code' => 'DC-NTH', 'name' => 'North Distribution Center', 'description' => 'Northern Luzon DC'],
            ['code' => 'DC-STH', 'name' => 'South Distribution Center', 'description' => 'Southern Luzon DC'],
            ['code' => 'BR-ILO', 'name' => 'Iloilo Branch', 'description' => 'Branch office in Iloilo'],
            ['code' => 'BR-BAG', 'name' => 'Baguio Branch', 'description' => 'Branch office in Baguio'],
            ['code' => 'HUB-CLK', 'name' => 'Clark Hub', 'description' => 'Logistics hub in Clark'],
            ['code' => 'HUB-SUB', 'name' => 'Subic Hub', 'description' => 'Logistics hub in Subic'],
            ['code' => 'RET-MOA', 'name' => 'Mall of Asia', 'description' => 'Retail outlet in MOA'],
            ['code' => 'RET-SM', 'name' => 'SM Megamall', 'description' => 'Retail outlet in SM Megamall'],
            ['code' => 'SVC-MNL', 'name' => 'Service Center Manila', 'description' => 'Customer service center'],
        ];

        foreach ($locations as $location) {
            Location::create($location);
        }
    }
}
