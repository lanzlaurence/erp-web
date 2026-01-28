<?php

namespace Database\Seeders;

use App\Models\Charge;
use Illuminate\Database\Seeder;

class ChargeSeeder extends Seeder
{
    public function run(): void
    {
        $charges = [
            // Service & Handling Charges (Taxes)
            [
                'name' => 'Delivery Charge',
                'description' => 'Standard delivery fee',
                'type' => 'tax',
                'value_type' => 'fixed',
                'value' => 150.00,
                'status' => 'active',
            ],
            [
                'name' => 'Handling Fee',
                'description' => 'Material handling and processing fee',
                'type' => 'tax',
                'value_type' => 'fixed',
                'value' => 100.00,
                'status' => 'active',
            ],
            [
                'name' => 'Service Charge (5%)',
                'description' => 'Service charge for custom orders',
                'type' => 'tax',
                'value_type' => 'percentage',
                'value' => 5.00,
                'status' => 'active',
            ],
            [
                'name' => 'Environmental Fee',
                'description' => 'Environmental compliance fee',
                'type' => 'tax',
                'value_type' => 'fixed',
                'value' => 50.00,
                'status' => 'active',
            ],
            [
                'name' => 'Installation Fee',
                'description' => 'On-site installation service',
                'type' => 'tax',
                'value_type' => 'fixed',
                'value' => 500.00,
                'status' => 'active',
            ],

            // Discounts
            [
                'name' => 'Senior Citizen Discount (20%)',
                'description' => 'Discount for senior citizens (with valid ID)',
                'type' => 'discount',
                'value_type' => 'percentage',
                'value' => 20.00,
                'status' => 'active',
            ],
            [
                'name' => 'PWD Discount (20%)',
                'description' => 'Discount for persons with disability (with valid ID)',
                'type' => 'discount',
                'value_type' => 'percentage',
                'value' => 20.00,
                'status' => 'active',
            ],
            [
                'name' => 'Bulk Order Discount (10%)',
                'description' => 'Discount for orders above certain quantity',
                'type' => 'discount',
                'value_type' => 'percentage',
                'value' => 10.00,
                'status' => 'active',
            ],
            [
                'name' => 'Early Payment Discount (5%)',
                'description' => 'Discount for payment within 7 days',
                'type' => 'discount',
                'value_type' => 'percentage',
                'value' => 5.00,
                'status' => 'active',
            ],
            [
                'name' => 'Trade Discount (15%)',
                'description' => 'Special discount for trade partners',
                'type' => 'discount',
                'value_type' => 'percentage',
                'value' => 15.00,
                'status' => 'active',
            ],
            [
                'name' => 'Promotional Discount',
                'description' => 'Fixed promotional discount for campaigns',
                'type' => 'discount',
                'value_type' => 'fixed',
                'value' => 500.00,
                'status' => 'active',
            ],
            [
                'name' => 'Loyalty Discount (3%)',
                'description' => 'Discount for loyal/repeat customers',
                'type' => 'discount',
                'value_type' => 'percentage',
                'value' => 3.00,
                'status' => 'inactive',
            ],
        ];

        foreach ($charges as $charge) {
            Charge::create($charge);
        }
    }
}
