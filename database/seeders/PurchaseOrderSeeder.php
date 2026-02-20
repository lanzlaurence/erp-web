<?php

namespace Database\Seeders;

use App\Models\Charge;
use App\Models\GoodsReceipt;
use App\Models\GoodsReceiptItem;
use App\Models\Inventory;
use App\Models\InventoryLog;
use App\Models\Material;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderCharge;
use App\Models\PurchaseOrderItem;
use App\Models\Vendor;
use App\Models\Destination;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PurchaseOrderSeeder extends Seeder
{
    public function run(): void
    {
        $user         = User::first();
        $vendors      = Vendor::where('status', 'active')->get();
        $materials    = Material::where('status', 'active')->get();
        $destinations = Destination::all();
        $charges      = Charge::where('status', 'active')->get();

        $orders = [
            [
                'vendor_code'   => '200001',
                'order_date'    => '2026-01-05',
                'delivery_date' => '2026-01-15',
                'reference_no'  => 'REF-2026-001',
                'status'        => 'completed',
                'remarks'       => 'First order of the year',
                'items' => [
                    ['code' => '300001', 'qty' => 50,  'unit_price' => 240.00, 'discount_type' => 'percentage', 'discount_amount' => 5,   'is_vatable' => true,  'vat_type' => 'exclusive', 'vat_rate' => 12],
                    ['code' => '300002', 'qty' => 100, 'unit_price' => 170.00, 'discount_type' => null,         'discount_amount' => 0,   'is_vatable' => true,  'vat_type' => 'exclusive', 'vat_rate' => 12],
                    ['code' => '300003', 'qty' => 30,  'unit_price' => 620.00, 'discount_type' => 'fixed',      'discount_amount' => 20,  'is_vatable' => true,  'vat_type' => 'exclusive', 'vat_rate' => 12],
                ],
                'charge_codes' => [],
                'gr' => [
                    [
                        'destination_code' => 'WH-MNL',
                        'gr_date'          => '2026-01-10',
                        'transaction_date' => '2026-01-10',
                        'status'           => 'completed',
                        'remarks'          => 'Full delivery received',
                        'items' => [
                            ['code' => '300001', 'qty_to_receive' => 50],
                            ['code' => '300002', 'qty_to_receive' => 100],
                            ['code' => '300003', 'qty_to_receive' => 30],
                        ],
                    ],
                ],
            ],
            [
                'vendor_code'   => '200002',
                'order_date'    => '2026-01-12',
                'delivery_date' => '2026-01-25',
                'reference_no'  => 'REF-2026-002',
                'status'        => 'fully_received',
                'remarks'       => 'Electrical supplies order',
                'items' => [
                    ['code' => '300005', 'qty' => 80,  'unit_price' => 820.00, 'discount_type' => 'percentage', 'discount_amount' => 5,  'is_vatable' => true,  'vat_type' => 'exclusive', 'vat_rate' => 12],
                    ['code' => '300007', 'qty' => 150, 'unit_price' => 110.00, 'discount_type' => null,         'discount_amount' => 0,  'is_vatable' => false, 'vat_type' => null,        'vat_rate' => 0],
                ],
                'charge_codes' => [],
                'gr' => [
                    [
                        'destination_code' => 'WH-CEB',
                        'gr_date'          => '2026-01-20',
                        'transaction_date' => '2026-01-20',
                        'status'           => 'completed',
                        'remarks'          => 'Full delivery received',
                        'items' => [
                            ['code' => '300005', 'qty_to_receive' => 80],
                            ['code' => '300007', 'qty_to_receive' => 150],
                        ],
                    ],
                ],
            ],
            [
                'vendor_code'   => '200001',
                'order_date'    => '2026-01-20',
                'delivery_date' => '2026-02-05',
                'reference_no'  => 'REF-2026-003',
                'status'        => 'partially_received',
                'remarks'       => 'Partial delivery expected',
                'items' => [
                    ['code' => '300004', 'qty' => 40,  'unit_price' => 1150.00, 'discount_type' => 'fixed',      'discount_amount' => 50, 'is_vatable' => true,  'vat_type' => 'exclusive', 'vat_rate' => 12],
                    ['code' => '300006', 'qty' => 500, 'unit_price' => 42.00,   'discount_type' => 'percentage', 'discount_amount' => 3,  'is_vatable' => true,  'vat_type' => 'exclusive', 'vat_rate' => 12],
                    ['code' => '300009', 'qty' => 20,  'unit_price' => 1800.00, 'discount_type' => null,         'discount_amount' => 0,  'is_vatable' => true,  'vat_type' => 'exclusive', 'vat_rate' => 12],
                ],
                'charge_codes' => [],
                'gr' => [
                    [
                        'destination_code' => 'WH-MNL',
                        'gr_date'          => '2026-01-28',
                        'transaction_date' => '2026-01-28',
                        'status'           => 'completed',
                        'remarks'          => 'First partial delivery',
                        'items' => [
                            ['code' => '300004', 'qty_to_receive' => 20],
                            ['code' => '300006', 'qty_to_receive' => 300],
                            ['code' => '300009', 'qty_to_receive' => 10],
                        ],
                    ],
                ],
            ],
            [
                'vendor_code'   => '200003',
                'order_date'    => '2026-02-01',
                'delivery_date' => '2026-02-15',
                'reference_no'  => 'REF-2026-004',
                'status'        => 'posted',
                'remarks'       => 'Pending delivery',
                'items' => [
                    ['code' => '300008', 'qty' => 20,  'unit_price' => 750.00,  'discount_type' => null,         'discount_amount' => 0,  'is_vatable' => false, 'vat_type' => null,        'vat_rate' => 0],
                    ['code' => '300011', 'qty' => 300, 'unit_price' => 26.00,   'discount_type' => 'percentage', 'discount_amount' => 5,  'is_vatable' => false, 'vat_type' => null,        'vat_rate' => 0],
                    ['code' => '300012', 'qty' => 30,  'unit_price' => 580.00,  'discount_type' => null,         'discount_amount' => 0,  'is_vatable' => false, 'vat_type' => null,        'vat_rate' => 0],
                ],
                'charge_codes' => [],
                'gr' => [],
            ],
            [
                'vendor_code'   => '200002',
                'order_date'    => '2026-02-05',
                'delivery_date' => '2026-02-20',
                'reference_no'  => 'REF-2026-005',
                'status'        => 'draft',
                'remarks'       => 'Draft order for review',
                'items' => [
                    ['code' => '300013', 'qty' => 50,  'unit_price' => 170.00,  'discount_type' => null,         'discount_amount' => 0,  'is_vatable' => false, 'vat_type' => null,        'vat_rate' => 0],
                    ['code' => '300014', 'qty' => 100, 'unit_price' => 230.00,  'discount_type' => 'fixed',      'discount_amount' => 10, 'is_vatable' => true,  'vat_type' => 'exclusive', 'vat_rate' => 12],
                ],
                'charge_codes' => [],
                'gr' => [],
            ],
        ];

        foreach ($orders as $orderData) {
            $vendor = $vendors->where('code', $orderData['vendor_code'])->first();
            if (!$vendor) continue;

            DB::transaction(function () use ($orderData, $vendor, $materials, $destinations, $charges, $user) {
                // Create PO
                $po = PurchaseOrder::create([
                    'vendor_id'      => $vendor->id,
                    'user_id'        => $user->id,
                    'status'         => 'draft',
                    'order_date'     => $orderData['order_date'],
                    'delivery_date'  => $orderData['delivery_date'],
                    'reference_no'   => $orderData['reference_no'],
                    'remarks'        => $orderData['remarks'],
                    'discount_type'  => null,
                    'discount_amount' => 0,
                ]);

                $po->logs()->create([
                    'user_id'   => $user->id,
                    'action'    => 'created',
                    'to_status' => 'draft',
                    'remarks'   => 'Purchase order created',
                ]);

                // Create items
                foreach ($orderData['items'] as $index => $itemData) {
                    $material = $materials->where('code', $itemData['code'])->first();
                    if (!$material) continue;

                    $unitPrice    = $itemData['unit_price'];
                    $qty          = $itemData['qty'];
                    $discountType = $itemData['discount_type'];
                    $discountAmt  = $itemData['discount_amount'];
                    $isVatable    = $itemData['is_vatable'];
                    $vatType      = $itemData['vat_type'];
                    $vatRate      = $itemData['vat_rate'];

                    $unitAfterDiscount = $unitPrice;
                    if ($discountType === 'fixed') {
                        $unitAfterDiscount = max(0, $unitPrice - $discountAmt);
                    } elseif ($discountType === 'percentage') {
                        $unitAfterDiscount = $unitPrice * (1 - $discountAmt / 100);
                    }

                    $netPrice = $unitAfterDiscount * $qty;
                    $vatPrice = 0;
                    if ($isVatable && $vatType === 'exclusive') {
                        $vatPrice = $netPrice * ($vatRate / 100);
                    } elseif ($isVatable && $vatType === 'inclusive') {
                        $vatPrice = $netPrice - ($netPrice / (1 + $vatRate / 100));
                    }

                    $grossPrice = $vatType === 'exclusive' ? $netPrice + $vatPrice : $netPrice;

                    PurchaseOrderItem::create([
                        'purchase_order_id'         => $po->id,
                        'material_id'               => $material->id,
                        'line_number'               => $index + 1,
                        'qty_ordered'               => $qty,
                        'qty_received'              => 0,
                        'unit_price'                => $unitPrice,
                        'discount_type'             => $discountType,
                        'discount_amount'           => $discountAmt,
                        'unit_price_after_discount' => $unitAfterDiscount,
                        'net_price'                 => $netPrice,
                        'is_vatable'                => $isVatable,
                        'vat_type'                  => $vatType,
                        'vat_rate'                  => $vatRate,
                        'vat_price'                 => $vatPrice,
                        'gross_price'               => $grossPrice,
                    ]);
                }

                // Recalculate totals
                $po->refresh();
                $items               = $po->items;
                $totalBeforeDiscount = $items->sum(fn($i) => (float)$i->unit_price * (float)$i->qty_ordered);
                $totalItemDiscount   = $items->sum(fn($i) => ((float)$i->unit_price - (float)$i->unit_price_after_discount) * (float)$i->qty_ordered);
                $totalNetPrice       = $items->sum(fn($i) => (float)$i->net_price);
                $totalVat            = $items->sum(fn($i) => (float)$i->vat_price);
                $totalGross          = $items->sum(fn($i) => (float)$i->gross_price);

                $po->update([
                    'total_before_discount' => $totalBeforeDiscount,
                    'total_item_discount'   => $totalItemDiscount,
                    'total_net_price'       => $totalNetPrice,
                    'total_vat'             => $totalVat,
                    'total_gross'           => $totalGross,
                    'header_discount_total' => 0,
                    'total_charges'         => 0,
                    'grand_total'           => $totalGross,
                ]);

                // Post if not draft
                if ($orderData['status'] !== 'draft') {
                    $po->update(['status' => 'posted']);
                    $po->logs()->create([
                        'user_id'     => $user->id,
                        'action'      => 'posted',
                        'from_status' => 'draft',
                        'to_status'   => 'posted',
                        'remarks'     => 'Purchase order posted',
                    ]);
                }

                // Create GRs
                foreach ($orderData['gr'] as $grData) {
                    $destination = $destinations->where('code', $grData['destination_code'])->first();
                    if (!$destination) continue;

                    $gr = GoodsReceipt::create([
                        'purchase_order_id' => $po->id,
                        'user_id'           => $user->id,
                        'destination_id'    => $destination->id,
                        'status'            => 'pending',
                        'gr_date'           => $grData['gr_date'],
                        'transaction_date'  => $grData['transaction_date'],
                        'remarks'           => $grData['remarks'],
                    ]);

                    $gr->logs()->create([
                        'user_id'   => $user->id,
                        'action'    => 'created',
                        'to_status' => 'pending',
                        'remarks'   => 'GR created',
                    ]);

                    $allFull = true;

                    foreach ($grData['items'] as $grItemData) {
                        $material = $materials->where('code', $grItemData['code'])->first();
                        if (!$material) continue;

                        $poItem = $po->items->where('material_id', $material->id)->first();
                        if (!$poItem) continue;

                        $qtyToReceive = $grItemData['qty_to_receive'];
                        $qtyReceived  = (float) $poItem->qty_received;
                        $qtyOrdered   = (float) $poItem->qty_ordered;
                        $qtyRemaining = $qtyOrdered - $qtyReceived - $qtyToReceive;

                        GoodsReceiptItem::create([
                            'goods_receipt_id'       => $gr->id,
                            'purchase_order_item_id' => $poItem->id,
                            'material_id'            => $material->id,
                            'qty_ordered'            => $qtyOrdered,
                            'qty_received'           => $qtyReceived,
                            'qty_to_receive'         => $qtyToReceive,
                            'qty_remaining'          => $qtyRemaining,
                            'unit_cost'              => $poItem->unit_price_after_discount,
                        ]);

                        // Update PO item qty_received
                        $poItem->update(['qty_received' => $qtyReceived + $qtyToReceive]);

                        if ($qtyReceived + $qtyToReceive < $qtyOrdered) {
                            $allFull = false;
                        }

                        // Update inventory
                        if ($grData['status'] === 'completed') {
                            $inventory = Inventory::withTrashed()
                                ->where('material_id', $material->id)
                                ->where('destination_id', $destination->id)
                                ->first();

                            if ($inventory) {
                                if ($inventory->trashed()) $inventory->restore();
                                $qtyBefore = (float) $inventory->quantity;
                                $inventory->update(['quantity' => $qtyBefore + $qtyToReceive]);
                            } else {
                                $qtyBefore = 0;
                                $inventory = Inventory::create([
                                    'code'           => Inventory::generateCode(),
                                    'material_id'    => $material->id,
                                    'destination_id' => $destination->id,
                                    'quantity'       => $qtyToReceive,
                                ]);
                            }

                            InventoryLog::create([
                                'movement_code'   => InventoryLog::generateMovementCode(),
                                'inventory_id'    => $inventory->id,
                                'material_id'     => $material->id,
                                'destination_id'  => $destination->id,
                                'user_id'         => $user->id,
                                'type'            => 'purchase_receipt',
                                'quantity_before' => $qtyBefore,
                                'quantity_change' => $qtyToReceive,
                                'quantity_after'  => $qtyBefore + $qtyToReceive,
                                'reference_id'    => $gr->id,
                                'reference_type'  => GoodsReceipt::class,
                                'remarks'         => "GR {$gr->gr_number} received",
                            ]);
                        }
                    }

                    // Update GR status
                    if ($grData['status'] === 'completed') {
                        $grStatus = $allFull ? 'fully_received' : 'partially_received';
                        $gr->update(['status' => $grStatus]);
                        $gr->logs()->create([
                            'user_id'     => $user->id,
                            'action'      => 'completed',
                            'from_status' => 'pending',
                            'to_status'   => $grStatus,
                            'remarks'     => 'GR completed',
                        ]);
                    }
                }

                // Final PO status
                $po->refresh();
                $finalStatus = $orderData['status'];
                if (!in_array($finalStatus, ['draft', 'posted'])) {
                    $po->update(['status' => $finalStatus]);
                    $po->logs()->create([
                        'user_id'     => $user->id,
                        'action'      => 'status_updated',
                        'from_status' => 'posted',
                        'to_status'   => $finalStatus,
                        'remarks'     => 'Status updated',
                    ]);
                }
            });
        }
    }
}
