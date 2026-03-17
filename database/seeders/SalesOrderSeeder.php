<?php

namespace Database\Seeders;

use App\Models\Charge;
use App\Models\Customer;
use App\Models\GoodsIssue;
use App\Models\GoodsIssueItem;
use App\Models\Inventory;
use App\Models\InventoryLog;
use App\Models\Location;
use App\Models\Material;
use App\Models\SalesOrder;
use App\Models\SalesOrderItem;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SalesOrderSeeder extends Seeder
{
    public function run(): void
    {
        $user      = User::first();
        $customers = Customer::where('status', 'active')->get();
        $materials = Material::where('status', 'active')->get();
        $locations = Location::all();

        $orders = [
            [
                'customer_code' => '100001',
                'order_date'    => '2026-01-15',
                'delivery_date' => '2026-01-25',
                'reference_no'  => 'SREF-2026-001',
                'status'        => 'fully_shipped',
                'remarks'       => 'First sales order',
                'items' => [
                    ['code' => '300001', 'qty' => 20, 'unit_price' => 320.00, 'discount_type' => null,         'discount_amount' => 0, 'is_vatable' => true,  'vat_type' => 'exclusive', 'vat_rate' => 12],
                    ['code' => '300002', 'qty' => 50, 'unit_price' => 220.00, 'discount_type' => 'percentage', 'discount_amount' => 5, 'is_vatable' => true,  'vat_type' => 'exclusive', 'vat_rate' => 12],
                ],
                'charges' => [],
                'gi' => [
                    [
                        'location_code'    => 'WH-MNL',
                        'gi_date'          => '2026-01-20',
                        'transaction_date' => '2026-01-20',
                        'status'           => 'completed',
                        'remarks'          => 'Full delivery issued',
                        'items' => [
                            ['code' => '300001', 'qty_to_ship' => 20],
                            ['code' => '300002', 'qty_to_ship' => 50],
                        ],
                    ],
                ],
            ],
            [
                'customer_code' => '100002',
                'order_date'    => '2026-01-22',
                'delivery_date' => '2026-02-05',
                'reference_no'  => 'SREF-2026-002',
                'status'        => 'partially_shipped',
                'remarks'       => 'Partial delivery',
                'items' => [
                    ['code' => '300003', 'qty' => 15, 'unit_price' => 800.00,  'discount_type' => 'fixed', 'discount_amount' => 30, 'is_vatable' => true, 'vat_type' => 'exclusive', 'vat_rate' => 12],
                    ['code' => '300005', 'qty' => 30, 'unit_price' => 1100.00, 'discount_type' => null,    'discount_amount' => 0,  'is_vatable' => true, 'vat_type' => 'exclusive', 'vat_rate' => 12],
                ],
                'charges' => [],
                'gi' => [
                    [
                        'location_code'    => 'WH-MNL',
                        'gi_date'          => '2026-01-28',
                        'transaction_date' => '2026-01-28',
                        'status'           => 'completed',
                        'remarks'          => 'First partial issue',
                        'items' => [
                            ['code' => '300003', 'qty_to_ship' => 8],
                            ['code' => '300005', 'qty_to_ship' => 15],
                        ],
                    ],
                    [
                        'location_code'    => 'WH-MNL',
                        'gi_date'          => '2026-02-03',
                        'transaction_date' => '2026-02-03',
                        'status'           => 'pending',
                        'remarks'          => 'Remaining pending',
                        'items' => [
                            ['code' => '300003', 'qty_to_ship' => 7],
                            ['code' => '300005', 'qty_to_ship' => 15],
                        ],
                    ],
                ],
            ],
            [
                'customer_code' => '100001',
                'order_date'    => '2026-02-01',
                'delivery_date' => '2026-02-15',
                'reference_no'  => 'SREF-2026-003',
                'status'        => 'posted',
                'remarks'       => 'Awaiting issue',
                'items' => [
                    ['code' => '300007', 'qty' => 100, 'unit_price' => 150.00, 'discount_type' => null, 'discount_amount' => 0, 'is_vatable' => false, 'vat_type' => null, 'vat_rate' => 0],
                ],
                'charges' => [],
                'gi' => [],
            ],
            [
                'customer_code' => '100002',
                'order_date'    => '2026-02-05',
                'delivery_date' => '2026-02-20',
                'reference_no'  => 'SREF-2026-004',
                'status'        => 'draft',
                'remarks'       => 'Draft for review',
                'items' => [
                    ['code' => '300004', 'qty' => 5, 'unit_price' => 1500.00, 'discount_type' => null, 'discount_amount' => 0, 'is_vatable' => true, 'vat_type' => 'exclusive', 'vat_rate' => 12],
                ],
                'charges' => [],
                'gi' => [],
            ],
            [
                'customer_code' => '100001',
                'order_date'    => '2026-02-08',
                'delivery_date' => '2026-02-22',
                'reference_no'  => 'SREF-2026-005',
                'status'        => 'cancelled',
                'remarks'       => 'Cancelled order',
                'items' => [
                    ['code' => '300001', 'qty' => 10, 'unit_price' => 320.00, 'discount_type' => null, 'discount_amount' => 0, 'is_vatable' => true, 'vat_type' => 'exclusive', 'vat_rate' => 12],
                ],
                'charges' => [],
                'gi' => [],
            ],
        ];

        foreach ($orders as $orderData) {
            $customer = $customers->where('code', $orderData['customer_code'])->first();
            if (!$customer) continue;

            DB::transaction(function () use ($orderData, $customer, $materials, $locations, $user) {
                $so = SalesOrder::create([
                    'customer_id'    => $customer->id,
                    'user_id'        => $user->id,
                    'status'         => 'draft',
                    'order_date'     => $orderData['order_date'],
                    'delivery_date'  => $orderData['delivery_date'],
                    'reference_no'   => $orderData['reference_no'],
                    'remarks'        => $orderData['remarks'],
                    'discount_type'  => null,
                    'discount_amount'=> 0,
                ]);

                $so->logs()->create([
                    'user_id'   => $user->id,
                    'action'    => 'created',
                    'to_status' => 'draft',
                    'remarks'   => 'Sales order created',
                ]);

                // Items
                foreach ($orderData['items'] as $index => $itemData) {
                    $material = $materials->where('code', $itemData['code'])->first();
                    if (!$material) continue;

                    $unitPrice = $itemData['unit_price'];
                    $qty       = $itemData['qty'];
                    $discType  = $itemData['discount_type'];
                    $discAmt   = $itemData['discount_amount'];
                    $isVatable = $itemData['is_vatable'];
                    $vatType   = $itemData['vat_type'];
                    $vatRate   = $itemData['vat_rate'];

                    $unitAfterDiscount = $unitPrice;
                    if ($discType === 'fixed') $unitAfterDiscount = max(0, $unitPrice - $discAmt);
                    elseif ($discType === 'percentage') $unitAfterDiscount = $unitPrice * (1 - $discAmt / 100);

                    $netPrice = $unitAfterDiscount * $qty;
                    $vatPrice = 0;
                    if ($isVatable && $vatType === 'exclusive') $vatPrice = $netPrice * ($vatRate / 100);
                    elseif ($isVatable && $vatType === 'inclusive') $vatPrice = $netPrice - ($netPrice / (1 + $vatRate / 100));
                    $grossPrice = ($vatType === 'exclusive') ? $netPrice + $vatPrice : $netPrice;

                    SalesOrderItem::create([
                        'sales_order_id'            => $so->id,
                        'material_id'               => $material->id,
                        'line_number'               => $index + 1,
                        'qty_ordered'               => $qty,
                        'qty_shipped'                => 0,
                        'unit_price'                => $unitPrice,
                        'discount_type'             => $discType,
                        'discount_amount'           => $discAmt,
                        'unit_price_after_discount' => $unitAfterDiscount,
                        'net_price'                 => $netPrice,
                        'is_vatable'                => $isVatable,
                        'vat_type'                  => $vatType,
                        'vat_rate'                  => $vatRate,
                        'vat_price'                 => $vatPrice,
                        'gross_price'               => $grossPrice,
                    ]);
                }

                // Charges
                $so->refresh();
                $items      = $so->items;
                $totalGross = $items->sum(fn($i) => (float) $i->gross_price);

                foreach ($orderData['charges'] as $chargeData) {
                    $charge = Charge::find($chargeData['charge_id']);
                    if (!$charge) continue;
                    $so->charges()->create([
                        'charge_id'       => $charge->id,
                        'name'            => $charge->name,
                        'type'            => $charge->type,
                        'value_type'      => $charge->value_type,
                        'value'           => $charge->value,
                        'computed_amount' => 0,
                    ]);
                }

                $headerDiscountTotal = 0;
                $afterHeaderDiscount = $totalGross - $headerDiscountTotal;
                $totalCharges        = 0;

                foreach ($so->charges as $soCharge) {
                    $computed = $soCharge->value_type === 'fixed'
                        ? (float) $soCharge->value
                        : $afterHeaderDiscount * ((float) $soCharge->value / 100);

                    $soCharge->update(['computed_amount' => $computed]);
                    $totalCharges += $soCharge->type === 'tax' ? $computed : -$computed;
                }

                $grandTotal = $afterHeaderDiscount + $totalCharges;

                $so->update([
                    'total_before_discount' => $items->sum(fn($i) => (float)$i->unit_price * (float)$i->qty_ordered),
                    'total_item_discount'   => $items->sum(fn($i) => ((float)$i->unit_price - (float)$i->unit_price_after_discount) * (float)$i->qty_ordered),
                    'total_net_price'       => $items->sum(fn($i) => (float)$i->net_price),
                    'total_vat'             => $items->sum(fn($i) => (float)$i->vat_price),
                    'total_gross'           => $totalGross,
                    'header_discount_total' => $headerDiscountTotal,
                    'total_charges'         => $totalCharges,
                    'grand_total'           => $grandTotal,
                ]);

                // Post
                if ($orderData['status'] !== 'draft') {
                    $so->update(['status' => 'posted']);
                    $so->logs()->create([
                        'user_id'     => $user->id,
                        'action'      => 'posted',
                        'from_status' => 'draft',
                        'to_status'   => 'posted',
                        'remarks'     => 'Sales order posted',
                    ]);
                }

                // Cancel early return
                if ($orderData['status'] === 'cancelled') {
                    $so->update(['status' => 'cancelled']);
                    $so->logs()->create([
                        'user_id'     => $user->id,
                        'action'      => 'cancelled',
                        'from_status' => 'posted',
                        'to_status'   => 'cancelled',
                        'remarks'     => 'Sales order cancelled',
                    ]);
                    return;
                }

                // Goods Issues
                foreach ($orderData['gi'] as $giData) {
                    $location = $locations->where('code', $giData['location_code'])->first();
                    if (!$location) continue;

                    $gi = GoodsIssue::create([
                        'sales_order_id'   => $so->id,
                        'user_id'          => $user->id,
                        'location_id'      => $location->id,
                        'status'           => 'pending',
                        'gi_date'          => $giData['gi_date'],
                        'transaction_date' => $giData['transaction_date'],
                        'remarks'          => $giData['remarks'],
                    ]);

                    $gi->logs()->create([
                        'user_id'   => $user->id,
                        'action'    => 'created',
                        'to_status' => 'pending',
                        'remarks'   => 'GI created',
                    ]);

                    foreach ($giData['items'] as $giItemData) {
                        $material = $materials->where('code', $giItemData['code'])->first();
                        if (!$material) continue;

                        $soItem = $so->items->where('material_id', $material->id)->first();
                        if (!$soItem) continue;

                        $qtyToIssue = $giItemData['qty_to_ship'];
                        $qtyIssued  = (float) $soItem->qty_shipped;
                        $qtyOrdered = (float) $soItem->qty_ordered;

                        GoodsIssueItem::create([
                            'goods_issue_id'      => $gi->id,
                            'sales_order_item_id' => $soItem->id,
                            'material_id'         => $material->id,
                            'qty_ordered'         => $qtyOrdered,
                            'qty_shipped'          => $qtyIssued,
                            'qty_to_ship'        => $qtyToIssue,
                            'qty_remaining'       => $qtyOrdered - $qtyIssued - $qtyToIssue,
                            'unit_price'          => $soItem->unit_price_after_discount,
                        ]);

                        if ($giData['status'] === 'completed') {
                            $soItem->update(['qty_shipped' => $qtyIssued + $qtyToIssue]);
                            $soItem->refresh();
                        }
                    }

                    if ($giData['status'] === 'completed') {
                        foreach ($gi->items as $giItem) {
                            $qtyToIssue = (float) $giItem->qty_to_ship;
                            if ($qtyToIssue <= 0) continue;

                            $inventory = Inventory::where('material_id', $giItem->material_id)
                                ->where('location_id', $location->id)
                                ->first();

                            if ($inventory) {
                                $qtyBefore = (float) $inventory->quantity;
                                $newQty    = max(0, $qtyBefore - $qtyToIssue);
                                $inventory->update(['quantity' => $newQty]);
                            } else {
                                $qtyBefore = 0;
                                $newQty    = 0;
                                $inventory = Inventory::create([
                                    'code'        => Inventory::generateCode(),
                                    'material_id' => $giItem->material_id,
                                    'location_id' => $location->id,
                                    'quantity'    => 0,
                                ]);
                            }

                            InventoryLog::create([
                                'movement_code'   => InventoryLog::generateMovementCode(),
                                'inventory_id'    => $inventory->id,
                                'material_id'     => $giItem->material_id,
                                'location_id'     => $location->id,
                                'user_id'         => $user->id,
                                'type'            => 'sales_issue',
                                'quantity_before' => $qtyBefore,
                                'quantity_change' => -$qtyToIssue,
                                'quantity_after'  => $newQty,
                                'reference_id'    => $gi->id,
                                'reference_type'  => GoodsIssue::class,
                                'remarks'         => "GI {$gi->code} issued",
                            ]);
                        }

                        $gi->update(['status' => 'completed']);
                        $gi->logs()->create([
                            'user_id'     => $user->id,
                            'action'      => 'completed',
                            'from_status' => 'pending',
                            'to_status'   => 'completed',
                            'remarks'     => 'GI completed',
                        ]);
                    }
                }

                // Final status
                $finalStatus = $orderData['status'];
                if (!in_array($finalStatus, ['draft', 'posted', 'cancelled'])) {
                    $so->refresh();
                    $so->update(['status' => $finalStatus]);
                    $so->logs()->create([
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
