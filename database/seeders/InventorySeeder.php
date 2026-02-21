<?php

namespace Database\Seeders;

use App\Models\Location;
use App\Models\Inventory;
use App\Models\InventoryLog;
use App\Models\Material;
use App\Models\User;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        $materials = Material::where('status', 'active')->get();
        $locations = Location::all();

        $inventoryData = [
            // Manila Warehouse - main stock
            ['material' => '300001', 'location' => 'WH-MNL', 'quantity' => 250.00],
            ['material' => '300002', 'location' => 'WH-MNL', 'quantity' => 500.00],
            ['material' => '300003', 'location' => 'WH-MNL', 'quantity' => 120.00],
            ['material' => '300004', 'location' => 'WH-MNL', 'quantity' => 80.00],
            ['material' => '300005', 'location' => 'WH-MNL', 'quantity' => 200.00],
            ['material' => '300006', 'location' => 'WH-MNL', 'quantity' => 1000.00],
            ['material' => '300007', 'location' => 'WH-MNL', 'quantity' => 300.00],
            ['material' => '300008', 'location' => 'WH-MNL', 'quantity' => 30.00],

            // Cebu Warehouse
            ['material' => '300001', 'location' => 'WH-CEB', 'quantity' => 100.00],
            ['material' => '300002', 'location' => 'WH-CEB', 'quantity' => 200.00],
            ['material' => '300003', 'location' => 'WH-CEB', 'quantity' => 50.00],
            ['material' => '300005', 'location' => 'WH-CEB', 'quantity' => 80.00],

            // Davao Warehouse
            ['material' => '300001', 'location' => 'WH-DAV', 'quantity' => 75.00],
            ['material' => '300002', 'location' => 'WH-DAV', 'quantity' => 150.00],
            ['material' => '300006', 'location' => 'WH-DAV', 'quantity' => 400.00],
            ['material' => '300007', 'location' => 'WH-DAV', 'quantity' => 120.00],

            // BGC Store
            ['material' => '300004', 'location' => 'ST-BGC', 'quantity' => 20.00],
            ['material' => '300006', 'location' => 'ST-BGC', 'quantity' => 150.00],
            ['material' => '300009', 'location' => 'ST-BGC', 'quantity' => 30.00],
            ['material' => '300010', 'location' => 'ST-BGC', 'quantity' => 15.00],

            // Makati Store
            ['material' => '300004', 'location' => 'ST-MAK', 'quantity' => 15.00],
            ['material' => '300006', 'location' => 'ST-MAK', 'quantity' => 200.00],
            ['material' => '300010', 'location' => 'ST-MAK', 'quantity' => 10.00],

            // North DC
            ['material' => '300001', 'location' => 'DC-NTH', 'quantity' => 180.00],
            ['material' => '300002', 'location' => 'DC-NTH', 'quantity' => 300.00],
            ['material' => '300011', 'location' => 'DC-NTH', 'quantity' => 600.00],
            ['material' => '300012', 'location' => 'DC-NTH', 'quantity' => 25.00],

            // Clark Hub
            ['material' => '300013', 'location' => 'HUB-CLK', 'quantity' => 100.00],
            ['material' => '300014', 'location' => 'HUB-CLK', 'quantity' => 200.00],
        ];

        foreach ($inventoryData as $item) {
            $material    = $materials->where('code', $item['material'])->first();
            $location = $locations->where('code', $item['location'])->first();

            if (!$material || !$location) continue;

            $inventory = Inventory::create([
                'code'           => Inventory::generateCode(),
                'material_id'    => $material->id,
                'location_id' => $location->id,
                'quantity'       => $item['quantity'],
            ]);

            // Initial stock log
            InventoryLog::create([
                'movement_code'   => InventoryLog::generateMovementCode(),
                'inventory_id'    => $inventory->id,
                'material_id'     => $material->id,
                'location_id'  => $location->id,
                'user_id'         => $user->id,
                'type'            => 'initial',
                'quantity_before' => 0,
                'quantity_change' => $item['quantity'],
                'quantity_after'  => $item['quantity'],
                'remarks'         => 'Initial stock',
            ]);
        }

        // Add some adjustment logs on Manila Warehouse items
        $adjustments = [
            ['material' => '300001', 'location' => 'WH-MNL', 'quantity' => 270.00, 'remarks' => 'Stock count correction'],
            ['material' => '300002', 'location' => 'WH-MNL', 'quantity' => 480.00, 'remarks' => 'Damaged goods deduction'],
            ['material' => '300004', 'location' => 'WH-MNL', 'quantity' => 90.00,  'remarks' => 'Physical count adjustment'],
        ];

        foreach ($adjustments as $adj) {
            $material    = $materials->where('code', $adj['material'])->first();
            $location = $locations->where('code', $adj['location'])->first();

            if (!$material || !$location) continue;

            $inventory = Inventory::where('material_id', $material->id)
                ->where('location_id', $location->id)
                ->first();

            if (!$inventory) continue;

            $quantityBefore = $inventory->quantity;
            $quantityChange = $adj['quantity'] - $quantityBefore;

            $inventory->update(['quantity' => $adj['quantity']]);

            InventoryLog::create([
                'movement_code'   => InventoryLog::generateMovementCode(),
                'inventory_id'    => $inventory->id,
                'material_id'     => $material->id,
                'location_id'  => $location->id,
                'user_id'         => $user->id,
                'type'            => 'adjustment',
                'quantity_before' => $quantityBefore,
                'quantity_change' => $quantityChange,
                'quantity_after'  => $adj['quantity'],
                'remarks'         => $adj['remarks'],
            ]);
        }

        // Add some transfer logs
        $transfers = [
            [
                'material'    => '300001',
                'from'        => 'WH-MNL',
                'to'          => 'DC-NTH',
                'quantity'    => 30.00,
                'remarks'     => 'Transfer to North DC for distribution',
            ],
            [
                'material'    => '300006',
                'from'        => 'WH-MNL',
                'to'          => 'ST-BGC',
                'quantity'    => 50.00,
                'remarks'     => 'Restocking BGC store',
            ],
        ];

        foreach ($transfers as $transfer) {
            $material    = $materials->where('code', $transfer['material'])->first();
            $fromDest    = $locations->where('code', $transfer['from'])->first();
            $toDest      = $locations->where('code', $transfer['to'])->first();

            if (!$material || !$fromDest || !$toDest) continue;

            $sourceInventory = Inventory::where('material_id', $material->id)
                ->where('location_id', $fromDest->id)
                ->first();

            if (!$sourceInventory) continue;

            $qty            = $transfer['quantity'];
            $sourceBefore   = $sourceInventory->quantity;
            $sourceAfter    = $sourceBefore - $qty;

            $sourceInventory->update(['quantity' => $sourceAfter]);

            InventoryLog::create([
                'movement_code'              => InventoryLog::generateMovementCode(),
                'inventory_id'               => $sourceInventory->id,
                'material_id'                => $material->id,
                'location_id'             => $fromDest->id,
                'user_id'                    => $user->id,
                'type'                       => 'transfer_out',
                'quantity_before'            => $sourceBefore,
                'quantity_change'            => -$qty,
                'quantity_after'             => $sourceAfter,
                'transfer_location_id' => $toDest->id,
                'remarks'                    => $transfer['remarks'],
            ]);

            $targetInventory = Inventory::where('material_id', $material->id)
                ->where('location_id', $toDest->id)
                ->first();

            $targetBefore = $targetInventory ? $targetInventory->quantity : 0;
            $targetAfter  = $targetBefore + $qty;

            if ($targetInventory) {
                $targetInventory->update(['quantity' => $targetAfter]);
            } else {
                $targetInventory = Inventory::create([
                    'code'           => Inventory::generateCode(),
                    'material_id'    => $material->id,
                    'location_id' => $toDest->id,
                    'quantity'       => $targetAfter,
                ]);
            }

            InventoryLog::create([
                'movement_code'              => InventoryLog::generateMovementCode(),
                'inventory_id'               => $targetInventory->id,
                'material_id'                => $material->id,
                'location_id'             => $toDest->id,
                'user_id'                    => $user->id,
                'type'                       => 'transfer_in',
                'quantity_before'            => $targetBefore,
                'quantity_change'            => $qty,
                'quantity_after'             => $targetAfter,
                'transfer_location_id' => $fromDest->id,
                'remarks'                    => $transfer['remarks'],
            ]);
        }
    }
}
