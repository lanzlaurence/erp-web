<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class LocalSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PermissionRoleLocalUserSeeder::class,
            PreferenceSeeder::class,
            UomSeeder::class,
            CurrencySeeder::class,
        ]);
    }
}
