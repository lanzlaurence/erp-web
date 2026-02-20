<?php

namespace Database\Seeders;

use App\Models\Destination;
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
        $destinations = Destination::all();

        $inventoryData = [
            // Manila Warehouse - main stock
            ['material' => '300001', 'destination' => 'WH-MNL', 'quantity' => 250.00],
            ['material' => '300002', 'destination' => 'WH-MNL', 'quantity' => 500.00],
            ['material' => '300003', 'destination' => 'WH-MNL', 'quantity' => 120.00],
            ['material' => '300004', 'destination' => 'WH-MNL', 'quantity' => 80.00],
            ['material' => '300005', 'destination' => 'WH-MNL', 'quantity' => 200.00],
            ['material' => '300006', 'destination' => 'WH-MNL', 'quantity' => 1000.00],
            ['material' => '300007', 'destination' => 'WH-MNL', 'quantity' => 300.00],
            ['material' => '300008', 'destination' => 'WH-MNL', 'quantity' => 30.00],

            // Cebu Warehouse
            ['material' => '300001', 'destination' => 'WH-CEB', 'quantity' => 100.00],
            ['material' => '300002', 'destination' => 'WH-CEB', 'quantity' => 200.00],
            ['material' => '300003', 'destination' => 'WH-CEB', 'quantity' => 50.00],
            ['material' => '300005', 'destination' => 'WH-CEB', 'quantity' => 80.00],

            // Davao Warehouse
            ['material' => '300001', 'destination' => 'WH-DAV', 'quantity' => 75.00],
            ['material' => '300002', 'destination' => 'WH-DAV', 'quantity' => 150.00],
            ['material' => '300006', 'destination' => 'WH-DAV', 'quantity' => 400.00],
            ['material' => '300007', 'destination' => 'WH-DAV', 'quantity' => 120.00],

            // BGC Store
            ['material' => '300004', 'destination' => 'ST-BGC', 'quantity' => 20.00],
            ['material' => '300006', 'destination' => 'ST-BGC', 'quantity' => 150.00],
            ['material' => '300009', 'destination' => 'ST-BGC', 'quantity' => 30.00],
            ['material' => '300010', 'destination' => 'ST-BGC', 'quantity' => 15.00],

            // Makati Store
            ['material' => '300004', 'destination' => 'ST-MAK', 'quantity' => 15.00],
            ['material' => '300006', 'destination' => 'ST-MAK', 'quantity' => 200.00],
            ['material' => '300010', 'destination' => 'ST-MAK', 'quantity' => 10.00],

            // North DC
            ['material' => '300001', 'destination' => 'DC-NTH', 'quantity' => 180.00],
            ['material' => '300002', 'destination' => 'DC-NTH', 'quantity' => 300.00],
            ['material' => '300011', 'destination' => 'DC-NTH', 'quantity' => 600.00],
            ['material' => '300012', 'destination' => 'DC-NTH', 'quantity' => 25.00],

            // Clark Hub
            ['material' => '300013', 'destination' => 'HUB-CLK', 'quantity' => 100.00],
            ['material' => '300014', 'destination' => 'HUB-CLK', 'quantity' => 200.00],
        ];

        foreach ($inventoryData as $item) {
            $material    = $materials->where('code', $item['material'])->first();
            $destination = $destinations->where('code', $item['destination'])->first();

            if (!$material || !$destination) continue;

            $inventory = Inventory::create([
                'code'           => Inventory::generateCode(),
                'material_id'    => $material->id,
                'destination_id' => $destination->id,
                'quantity'       => $item['quantity'],
            ]);

            // Initial stock log
            InventoryLog::create([
                'movement_code'   => InventoryLog::generateMovementCode(),
                'inventory_id'    => $inventory->id,
                'material_id'     => $material->id,
                'destination_id'  => $destination->id,
                'user_id'         => $user->id,
                'type'            => 'initial',
                'quantity_before' => 0,
                'quantity_change' => $item['quantity'],
                'quantity_after'  => $item['quantity'],
                'remarks'         => 'Initial stock seeder',
            ]);
        }

        // Add some adjustment logs on Manila Warehouse items
        $adjustments = [
            ['material' => '300001', 'destination' => 'WH-MNL', 'quantity' => 270.00, 'remarks' => 'Stock count correction'],
            ['material' => '300002', 'destination' => 'WH-MNL', 'quantity' => 480.00, 'remarks' => 'Damaged goods deduction'],
            ['material' => '300004', 'destination' => 'WH-MNL', 'quantity' => 90.00,  'remarks' => 'Physical count adjustment'],
        ];

        foreach ($adjustments as $adj) {
            $material    = $materials->where('code', $adj['material'])->first();
            $destination = $destinations->where('code', $adj['destination'])->first();

            if (!$material || !$destination) continue;

            $inventory = Inventory::where('material_id', $material->id)
                ->where('destination_id', $destination->id)
                ->first();

            if (!$inventory) continue;

            $quantityBefore = $inventory->quantity;
            $quantityChange = $adj['quantity'] - $quantityBefore;

            $inventory->update(['quantity' => $adj['quantity']]);

            InventoryLog::create([
                'movement_code'   => InventoryLog::generateMovementCode(),
                'inventory_id'    => $inventory->id,
                'material_id'     => $material->id,
                'destination_id'  => $destination->id,
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
            $fromDest    = $destinations->where('code', $transfer['from'])->first();
            $toDest      = $destinations->where('code', $transfer['to'])->first();

            if (!$material || !$fromDest || !$toDest) continue;

            $sourceInventory = Inventory::where('material_id', $material->id)
                ->where('destination_id', $fromDest->id)
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
                'destination_id'             => $fromDest->id,
                'user_id'                    => $user->id,
                'type'                       => 'transfer_out',
                'quantity_before'            => $sourceBefore,
                'quantity_change'            => -$qty,
                'quantity_after'             => $sourceAfter,
                'transfer_to_destination_id' => $toDest->id,
                'remarks'                    => $transfer['remarks'],
            ]);

            $targetInventory = Inventory::where('material_id', $material->id)
                ->where('destination_id', $toDest->id)
                ->first();

            $targetBefore = $targetInventory ? $targetInventory->quantity : 0;
            $targetAfter  = $targetBefore + $qty;

            if ($targetInventory) {
                $targetInventory->update(['quantity' => $targetAfter]);
            } else {
                $targetInventory = Inventory::create([
                    'code'           => Inventory::generateCode(),
                    'material_id'    => $material->id,
                    'destination_id' => $toDest->id,
                    'quantity'       => $targetAfter,
                ]);
            }

            InventoryLog::create([
                'movement_code'              => InventoryLog::generateMovementCode(),
                'inventory_id'               => $targetInventory->id,
                'material_id'                => $material->id,
                'destination_id'             => $toDest->id,
                'user_id'                    => $user->id,
                'type'                       => 'transfer_in',
                'quantity_before'            => $targetBefore,
                'quantity_change'            => $qty,
                'quantity_after'             => $targetAfter,
                'transfer_to_destination_id' => $fromDest->id,
                'remarks'                    => $transfer['remarks'],
            ]);
        }
    }
}
