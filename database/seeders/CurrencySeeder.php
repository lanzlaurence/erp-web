<?php

namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    public function run(): void
    {
        $currencies = [
            ['code' => 'PHP', 'name' => 'Philippine Peso', 'symbol' => '₱', 'exchange_rate' => 1.000000],
            ['code' => 'USD', 'name' => 'US Dollar', 'symbol' => '$', 'exchange_rate' => 0.017500],
            ['code' => 'EUR', 'name' => 'Euro', 'symbol' => '€', 'exchange_rate' => 0.016200],
            ['code' => 'GBP', 'name' => 'British Pound', 'symbol' => '£', 'exchange_rate' => 0.013900],
            ['code' => 'JPY', 'name' => 'Japanese Yen', 'symbol' => '¥', 'exchange_rate' => 2.650000],
            ['code' => 'CNY', 'name' => 'Chinese Yuan', 'symbol' => '¥', 'exchange_rate' => 0.127000],
            ['code' => 'AUD', 'name' => 'Australian Dollar', 'symbol' => 'A$', 'exchange_rate' => 0.027000],
            ['code' => 'CAD', 'name' => 'Canadian Dollar', 'symbol' => 'C$', 'exchange_rate' => 0.024000],
            ['code' => 'SGD', 'name' => 'Singapore Dollar', 'symbol' => 'S$', 'exchange_rate' => 0.023500],
            ['code' => 'HKD', 'name' => 'Hong Kong Dollar', 'symbol' => 'HK$', 'exchange_rate' => 0.137000],
            ['code' => 'KRW', 'name' => 'South Korean Won', 'symbol' => '₩', 'exchange_rate' => 23.50000],
            ['code' => 'INR', 'name' => 'Indian Rupee', 'symbol' => '₹', 'exchange_rate' => 1.460000],
            ['code' => 'MYR', 'name' => 'Malaysian Ringgit', 'symbol' => 'RM', 'exchange_rate' => 0.082000],
            ['code' => 'IDR', 'name' => 'Indonesian Rupiah', 'symbol' => 'Rp', 'exchange_rate' => 275.000000],
            ['code' => 'THB', 'name' => 'Thai Baht', 'symbol' => '฿', 'exchange_rate' => 0.630000],
            ['code' => 'VND', 'name' => 'Vietnamese Dong', 'symbol' => '₫', 'exchange_rate' => 432.000000],
            ['code' => 'SAR', 'name' => 'Saudi Riyal', 'symbol' => '﷼', 'exchange_rate' => 0.066000],
            ['code' => 'AED', 'name' => 'UAE Dirham', 'symbol' => 'د.إ','exchange_rate' => 0.064000],
        ];

        foreach ($currencies as $currency) {
            Currency::updateOrCreate(['code' => $currency['code']], $currency);
        }
    }
}
