<?php

namespace Database\Seeders;

use App\Models\GoodsReceipt;
use App\Models\GoodsReceiptItem;
use App\Models\Inventory;
use App\Models\InventoryLog;
use App\Models\Material;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Vendor;
use App\Models\Location;
use App\Models\TransactionLog;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PurchaseOrderSeeder extends Seeder
{
    public function run(): void
    {
        $user      = User::first();
        $vendors   = Vendor::all();
        $materials = Material::where('status', 'active')->get();
        $locations = Location::all();

        $whnMnl = $locations->where('code', 'WH-MNL')->first();
        $whCeb  = $locations->where('code', 'WH-CEB')->first();
        $whDav  = $locations->where('code', 'WH-DAV')->first();
        $dcNth  = $locations->where('code', 'DC-NTH')->first();
        $hubClk = $locations->where('code', 'HUB-CLK')->first();

        // ── Helpers ────────────────────────────────────────────────────────────

        /**
         * Build PO totals from a flat list of item arrays.
         * Each item: [material_id, qty, unit_cost, is_vatable]
         */
        $buildPoTotals = function (array $items): array {
            $totalBefore = 0;
            $totalVat    = 0;

            foreach ($items as &$item) {
                $net = round($item['qty'] * $item['unit_cost'], 2);
                $vat = $item['is_vatable'] ? round($net * 0.12, 2) : 0;

                $item['net_price']  = $net;
                $item['vat_price']  = $vat;
                $item['gross_price'] = $net + $vat;

                $totalBefore += $net;
                $totalVat    += $vat;
            }
            unset($item);

            return [
                'items'                 => $items,
                'total_before_discount' => $totalBefore,
                'total_item_discount'   => 0,
                'total_net_price'       => $totalBefore,
                'total_vat'             => $totalVat,
                'total_gross'           => $totalBefore + $totalVat,
                'total_charges'         => 0,
                'header_discount_total' => 0,
                'grand_total'           => $totalBefore + $totalVat,
            ];
        };

        /**
         * Create PO + items, return the PO model.
         */
        $createPo = function (
            array $poData,
            array $rawItems,
            string $status
        ) use ($user, $vendors, $materials, $buildPoTotals): PurchaseOrder {

            $computed = $buildPoTotals($rawItems);

            $po = PurchaseOrder::create([
                'vendor_id'             => $poData['vendor_id'],
                'user_id'               => $user->id,
                'status'                => $status,
                'order_date'            => $poData['order_date'],
                'delivery_date'         => $poData['delivery_date'] ?? null,
                'reference_no'          => $poData['reference_no']  ?? null,
                'discount_type'         => null,
                'discount_amount'       => 0,
                'total_before_discount' => $computed['total_before_discount'],
                'total_item_discount'   => 0,
                'total_net_price'       => $computed['total_net_price'],
                'total_vat'             => $computed['total_vat'],
                'total_gross'           => $computed['total_gross'],
                'total_charges'         => 0,
                'header_discount_total' => 0,
                'grand_total'           => $computed['grand_total'],
                'remarks'               => $poData['remarks'] ?? null,
            ]);

            foreach ($computed['items'] as $line => $item) {
                PurchaseOrderItem::create([
                    'purchase_order_id'        => $po->id,
                    'material_id'              => $item['material_id'],
                    'line_number'              => $line + 1,
                    'qty_ordered'              => $item['qty'],
                    'qty_received'             => $item['qty_received'] ?? 0,
                    'unit_cost'               => $item['unit_cost'],
                    'discount_type'            => null,
                    'discount_amount'          => 0,
                    'unit_cost_after_discount' => $item['unit_cost'],
                    'net_price'                => $item['net_price'],
                    'is_vatable'               => $item['is_vatable'],
                    'vat_type'                 => $item['is_vatable'] ? 'inclusive' : null,
                    'vat_rate'                 => $item['is_vatable'] ? 12 : 0,
                    'vat_price'                => $item['vat_price'],
                    'gross_price'              => $item['gross_price'],
                    'remarks'                  => $item['remarks'] ?? null,
                ]);
            }

            return $po;
        };

        /**
         * Create a GR + its items; optionally complete it (updates inventory).
         */
        $createGr = function (
            PurchaseOrder $po,
            array $grLines,       // [purchase_order_item_id => qty_to_receive]
            Location $location,
            string $grStatus,
            string $grDate,
            string $remarks = ''
        ) use ($user, $materials): GoodsReceipt {

            $gr = GoodsReceipt::create([
                'purchase_order_id' => $po->id,
                'user_id'           => $user->id,
                'location_id'       => $location->id,
                'status'            => $grStatus,
                'gr_date'           => $grDate,
                'transaction_date'  => $grDate,
                'remarks'           => $remarks,
            ]);

            TransactionLog::create([
                'user_id'       => $user->id,
                'action'        => 'created',
                'from_status'   => null,
                'to_status'     => 'pending',
                'loggable_id'   => $gr->id,
                'loggable_type' => GoodsReceipt::class,
            ]);

            foreach ($grLines as $poItemId => $qtyToReceive) {
                $poItem = PurchaseOrderItem::find($poItemId);

                GoodsReceiptItem::create([
                    'goods_receipt_id'      => $gr->id,
                    'purchase_order_item_id' => $poItemId,
                    'material_id'           => $poItem->material_id,
                    'qty_ordered'           => $poItem->qty_ordered,
                    'qty_received'          => $poItem->qty_received,
                    'qty_to_receive'        => $qtyToReceive,
                    'qty_remaining'         => $poItem->qty_ordered - $poItem->qty_received - $qtyToReceive,
                    'unit_cost'             => $poItem->unit_cost,
                ]);
            }

            // ── Complete GR: update inventory + PO item qty_received ───────────
            if ($grStatus === 'completed') {
                $this->completeGr($gr, $user);
            }

            // ── Cancel GR ─────────────────────────────────────────────────────
            if ($grStatus === 'cancelled') {
                TransactionLog::create([
                    'user_id'       => $user->id,
                    'action'        => 'cancelled',
                    'from_status'   => 'pending',
                    'to_status'     => 'cancelled',
                    'loggable_id'   => $gr->id,
                    'loggable_type' => GoodsReceipt::class,
                ]);
            }

            return $gr;
        };

        // ── PO 1: Draft – not yet posted ───────────────────────────────────────
        // Scenario: PO created and saved as draft, no further action taken.
        $createPo([
            'vendor_id'    => $vendors->where('code', '200001')->first()->id,
            'order_date'   => '2026-01-05',
            'delivery_date'=> '2026-01-20',
            'reference_no' => 'REF-2026-001',
            'remarks'      => 'Draft PO for steel rods – pending approval',
        ], [
            ['material_id' => $materials->where('code', '300001')->first()->id, 'qty' => 100, 'unit_cost' => 250.00, 'is_vatable' => true],
            ['material_id' => $materials->where('code', '300013')->first()->id, 'qty' => 50,  'unit_cost' => 180.00, 'is_vatable' => true],
        ], 'draft');

        // ── PO 2: Draft – multiple items, not posted ───────────────────────────
        // Scenario: Larger draft PO covering several materials.
        $createPo([
            'vendor_id'    => $vendors->where('code', '200002')->first()->id,
            'order_date'   => '2026-01-08',
            'delivery_date'=> '2026-01-25',
            'reference_no' => 'REF-2026-002',
            'remarks'      => 'Bulk order for site materials',
        ], [
            ['material_id' => $materials->where('code', '300002')->first()->id, 'qty' => 200, 'unit_cost' => 180.00, 'is_vatable' => true],
            ['material_id' => $materials->where('code', '300003')->first()->id, 'qty' => 50,  'unit_cost' => 650.00, 'is_vatable' => true],
            ['material_id' => $materials->where('code', '300007')->first()->id, 'qty' => 80,  'unit_cost' => 120.00, 'is_vatable' => false],
        ], 'draft');

        // ── PO 3: Posted – awaiting goods receipt ──────────────────────────────
        // Scenario: PO approved and posted; vendor has not delivered yet.
        $po3 = $createPo([
            'vendor_id'    => $vendors->where('code', '200003')->first()->id,
            'order_date'   => '2026-01-10',
            'delivery_date'=> '2026-01-28',
            'reference_no' => 'REF-2026-003',
            'remarks'      => 'Hardware order – awaiting delivery',
        ], [
            ['material_id' => $materials->where('code', '300001')->first()->id, 'qty' => 150, 'unit_cost' => 248.00, 'is_vatable' => true],
            ['material_id' => $materials->where('code', '300005')->first()->id, 'qty' => 60,  'unit_cost' => 850.00, 'is_vatable' => true],
        ], 'posted');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $po3->id,
            'loggable_type' => PurchaseOrder::class,
        ]);

        // ── PO 4: Posted – another open PO ────────────────────────────────────
        // Scenario: Posted, vendor acknowledged; delivery scheduled next week.
        $po4 = $createPo([
            'vendor_id'    => $vendors->where('code', '200004')->first()->id,
            'order_date'   => '2026-01-12',
            'delivery_date'=> '2026-02-05',
            'reference_no' => 'REF-2026-004',
        ], [
            ['material_id' => $materials->where('code', '300002')->first()->id, 'qty' => 300, 'unit_cost' => 178.00, 'is_vatable' => true],
            ['material_id' => $materials->where('code', '300008')->first()->id, 'qty' => 15,  'unit_cost' => 800.00, 'is_vatable' => false],
        ], 'posted');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $po4->id,
            'loggable_type' => PurchaseOrder::class,
        ]);

        // ── PO 5: Partially received – first shipment done ─────────────────────
        // Scenario: PO for 200 cement bags; first GR of 120 completed; 80 still open.
        $po5 = $createPo([
            'vendor_id'    => $vendors->where('code', '200004')->first()->id,
            'order_date'   => '2026-01-15',
            'delivery_date'=> '2026-02-01',
            'reference_no' => 'REF-2026-005',
            'remarks'      => 'Cement – split delivery arrangement',
        ], [
            ['material_id'    => $materials->where('code', '300002')->first()->id,
             'qty'            => 200,
             'unit_cost'      => 180.00,
             'is_vatable'     => true,
             'qty_received'   => 120],
            ['material_id'    => $materials->where('code', '300012')->first()->id,
             'qty'            => 20,
             'unit_cost'      => 600.00,
             'is_vatable'     => false,
             'qty_received'   => 20],
        ], 'partially_received');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $po5->id,
            'loggable_type' => PurchaseOrder::class,
        ]);

        $po5Items = $po5->items()->get();

        $gr5a = $createGr(
            $po5,
            [
                $po5Items[0]->id => 120,  // partial on cement
                $po5Items[1]->id => 20,   // full on sand
            ],
            $whnMnl,
            'completed',
            '2026-01-22',
            'First delivery – partial cement, full sand'
        );

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'completed',
            'from_status'   => 'pending',
            'to_status'     => 'completed',
            'loggable_id'   => $gr5a->id,
            'loggable_type' => GoodsReceipt::class,
        ]);

        // ── PO 6: Fully received – all items received in one GR ───────────────
        // Scenario: Clean single-delivery PO; fully received at Manila Warehouse.
        $po6 = $createPo([
            'vendor_id'    => $vendors->where('code', '200007')->first()->id,
            'order_date'   => '2026-01-18',
            'delivery_date'=> '2026-02-03',
            'reference_no' => 'REF-2026-006',
            'remarks'      => 'Electrical wire – full delivery expected',
        ], [
            ['material_id'  => $materials->where('code', '300005')->first()->id,
             'qty'          => 100,
             'unit_cost'    => 848.00,
             'is_vatable'   => true,
             'qty_received' => 100],
        ], 'fully_received');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $po6->id,
            'loggable_type' => PurchaseOrder::class,
        ]);

        $po6Items = $po6->items()->get();

        $gr6 = $createGr(
            $po6,
            [$po6Items[0]->id => 100],
            $whnMnl,
            'completed',
            '2026-02-03',
            'Full delivery received – all wire cable'
        );

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'completed',
            'from_status'   => 'pending',
            'to_status'     => 'completed',
            'loggable_id'   => $gr6->id,
            'loggable_type' => GoodsReceipt::class,
        ]);

        // ── PO 7: Fully received – two GRs (split delivery) ───────────────────
        // Scenario: PO of 80 plywood sheets; delivered in two batches of 40 each.
        $po7 = $createPo([
            'vendor_id'    => $vendors->where('code', '200005')->first()->id,
            'order_date'   => '2026-01-20',
            'delivery_date'=> '2026-02-10',
            'reference_no' => 'REF-2026-007',
            'remarks'      => 'Plywood – two truck loads',
        ], [
            ['material_id'  => $materials->where('code', '300003')->first()->id,
             'qty'          => 80,
             'unit_cost'    => 648.00,
             'is_vatable'   => true,
             'qty_received' => 80],
        ], 'fully_received');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $po7->id,
            'loggable_type' => PurchaseOrder::class,
        ]);

        $po7Items = $po7->items()->get();

        // First GR – 40 sheets
        $gr7a = $createGr(
            $po7,
            [$po7Items[0]->id => 40],
            $whnMnl,
            'completed',
            '2026-02-05',
            'First truck – 40 plywood sheets'
        );
        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'completed',
            'from_status'   => 'pending',
            'to_status'     => 'completed',
            'loggable_id'   => $gr7a->id,
            'loggable_type' => GoodsReceipt::class,
        ]);

        // Second GR – remaining 40 sheets
        $po7Items[0]->refresh();
        $gr7b = $createGr(
            $po7,
            [$po7Items[0]->id => 40],
            $whnMnl,
            'completed',
            '2026-02-10',
            'Second truck – remaining 40 plywood sheets'
        );
        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'completed',
            'from_status'   => 'pending',
            'to_status'     => 'completed',
            'loggable_id'   => $gr7b->id,
            'loggable_type' => GoodsReceipt::class,
        ]);

        // ── PO 8: Partially received – pending GR still open ──────────────────
        // Scenario: Tiles PO; partial GR completed; another GR still pending.
        $po8 = $createPo([
            'vendor_id'    => $vendors->where('code', '200008')->first()->id,
            'order_date'   => '2026-01-22',
            'delivery_date'=> '2026-02-15',
            'reference_no' => 'REF-2026-008',
            'remarks'      => 'Ceramic tiles – staggered delivery',
        ], [
            ['material_id'  => $materials->where('code', '300006')->first()->id,
             'qty'          => 800,
             'unit_cost'    => 44.00,
             'is_vatable'   => true,
             'qty_received' => 500],
        ], 'partially_received');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $po8->id,
            'loggable_type' => PurchaseOrder::class,
        ]);

        $po8Items = $po8->items()->get();

        $gr8completed = $createGr(
            $po8,
            [$po8Items[0]->id => 500],
            $whDav,
            'completed',
            '2026-02-05',
            'First tile delivery to Davao'
        );
        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'completed',
            'from_status'   => 'pending',
            'to_status'     => 'completed',
            'loggable_id'   => $gr8completed->id,
            'loggable_type' => GoodsReceipt::class,
        ]);

        $po8Items[0]->refresh();
        // Pending GR for the remaining 300 tiles
        $createGr(
            $po8,
            [$po8Items[0]->id => 300],
            $whDav,
            'pending',
            '2026-02-15',
            'Second tile delivery – pending vendor confirmation'
        );

        // ── PO 9: Cancelled PO – before any GR ───────────────────────────────
        // Scenario: PO posted but vendor couldn't fulfill; cancelled directly.
        $po9 = $createPo([
            'vendor_id'    => $vendors->where('code', '200009')->first()->id,
            'order_date'   => '2026-01-25',
            'delivery_date'=> '2026-02-20',
            'reference_no' => 'REF-2026-009',
            'remarks'      => 'Plumbing supplies – vendor cancelled due to stock shortage',
        ], [
            ['material_id' => $materials->where('code', '300007')->first()->id, 'qty' => 200, 'unit_cost' => 119.00, 'is_vatable' => true],
        ], 'cancelled');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $po9->id,
            'loggable_type' => PurchaseOrder::class,
        ]);
        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'cancelled',
            'from_status'   => 'posted',
            'to_status'     => 'cancelled',
            'remarks'       => 'Vendor unable to supply – cancelled',
            'loggable_id'   => $po9->id,
            'loggable_type' => PurchaseOrder::class,
        ]);

        // ── PO 10: Cancelled – had a completed GR then cancelled ──────────────
        // Scenario: Partial GR was completed, then remaining was cancelled (vendor issue).
        $po10 = $createPo([
            'vendor_id'    => $vendors->where('code', '200010')->first()->id,
            'order_date'   => '2026-01-28',
            'delivery_date'=> '2026-02-12',
            'reference_no' => 'REF-2026-010',
            'remarks'      => 'Aggregate order – partially delivered then cancelled',
        ], [
            ['material_id'  => $materials->where('code', '300008')->first()->id,
             'qty'          => 20,
             'unit_cost'    => 798.00,
             'is_vatable'   => false,
             'qty_received' => 8],
        ], 'cancelled');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $po10->id,
            'loggable_type' => PurchaseOrder::class,
        ]);

        $po10Items = $po10->items()->get();

        $gr10 = $createGr(
            $po10,
            [$po10Items[0]->id => 8],
            $hubClk,
            'completed',
            '2026-02-05',
            'Partial gravel delivery – 8 of 20 cubic meters'
        );
        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'completed',
            'from_status'   => 'pending',
            'to_status'     => 'completed',
            'loggable_id'   => $gr10->id,
            'loggable_type' => GoodsReceipt::class,
        ]);

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'cancelled',
            'from_status'   => 'partially_received',
            'to_status'     => 'cancelled',
            'remarks'       => 'Vendor unable to fulfill remaining 12 units',
            'loggable_id'   => $po10->id,
            'loggable_type' => PurchaseOrder::class,
        ]);

        // ── PO 11: GR created then cancelled, PO reverted to posted ──────────
        // Scenario: GR was made by mistake; cancelled and PO back to posted.
        $po11 = $createPo([
            'vendor_id'    => $vendors->where('code', '200011')->first()->id,
            'order_date'   => '2026-02-01',
            'delivery_date'=> '2026-02-20',
            'reference_no' => 'REF-2026-011',
            'remarks'      => 'Metalworks order – GR cancelled, awaiting re-delivery',
        ], [
            ['material_id' => $materials->where('code', '300009')->first()->id, 'qty' => 30, 'unit_cost' => 1848.00, 'is_vatable' => true],
        ], 'posted');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $po11->id,
            'loggable_type' => PurchaseOrder::class,
        ]);

        $po11Items = $po11->items()->get();

        // Pending GR – created then cancelled (wrong quantities entered)
        $gr11 = $createGr(
            $po11,
            [$po11Items[0]->id => 30],
            $dcNth,
            'cancelled',
            '2026-02-12',
            'Cancelled – wrong batch entered; re-delivery scheduled'
        );

        // ── PO 12: Multi-item, fully received at Cebu ─────────────────────────
        // Scenario: Cebu warehouse restocking; all items received.
        $po12 = $createPo([
            'vendor_id'    => $vendors->where('code', '200001')->first()->id,
            'order_date'   => '2026-02-05',
            'delivery_date'=> '2026-02-25',
            'reference_no' => 'REF-2026-012',
            'remarks'      => 'Cebu warehouse monthly restocking',
        ], [
            ['material_id'  => $materials->where('code', '300001')->first()->id,
             'qty'          => 80,
             'unit_cost'    => 250.00,
             'is_vatable'   => true,
             'qty_received' => 80],
            ['material_id'  => $materials->where('code', '300002')->first()->id,
             'qty'          => 150,
             'unit_cost'    => 180.00,
             'is_vatable'   => true,
             'qty_received' => 150],
        ], 'fully_received');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $po12->id,
            'loggable_type' => PurchaseOrder::class,
        ]);

        $po12Items = $po12->items()->get();

        $gr12 = $createGr(
            $po12,
            [
                $po12Items[0]->id => 80,
                $po12Items[1]->id => 150,
            ],
            $whCeb,
            'completed',
            '2026-02-22',
            'Full restocking delivery to Cebu warehouse'
        );
        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'completed',
            'from_status'   => 'pending',
            'to_status'     => 'completed',
            'loggable_id'   => $gr12->id,
            'loggable_type' => GoodsReceipt::class,
        ]);

        // ── PO 13: Posted – multi-item with no delivery date ──────────────────
        // Scenario: Posted PO with open-ended delivery; vendor to advise.
        $po13 = $createPo([
            'vendor_id'    => $vendors->where('code', '200012')->first()->id,
            'order_date'   => '2026-02-10',
            'delivery_date'=> null,
            'reference_no' => 'REF-2026-013',
            'remarks'      => 'Glass panels – delivery date TBD per vendor lead time',
        ], [
            ['material_id' => $materials->where('code', '300010')->first()->id, 'qty' => 40, 'unit_cost' => 1195.00, 'is_vatable' => true],
            ['material_id' => $materials->where('code', '300009')->first()->id, 'qty' => 25, 'unit_cost' => 1848.00, 'is_vatable' => true],
        ], 'posted');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $po13->id,
            'loggable_type' => PurchaseOrder::class,
        ]);

        // ── PO 14: Partially received – three-item PO, two fully, one partial ─
        // Scenario: Mixed receipt; lumber fully received, nails fully received,
        //           concrete blocks only half arrived.
        $po14 = $createPo([
            'vendor_id'    => $vendors->where('code', '200013')->first()->id,
            'order_date'   => '2026-02-12',
            'delivery_date'=> '2026-03-01',
            'reference_no' => 'REF-2026-014',
            'remarks'      => 'Masonry & carpentry supplies',
        ], [
            ['material_id'  => $materials->where('code', '300014')->first()->id,
             'qty'          => 100,
             'unit_cost'    => 244.00,
             'is_vatable'   => true,
             'qty_received' => 100],
            ['material_id'  => $materials->where('code', '300013')->first()->id,
             'qty'          => 30,
             'unit_cost'    => 178.00,
             'is_vatable'   => false,
             'qty_received' => 30],
            ['material_id'  => $materials->where('code', '300011')->first()->id,
             'qty'          => 400,
             'unit_cost'    => 27.50,
             'is_vatable'   => false,
             'qty_received' => 200],
        ], 'partially_received');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $po14->id,
            'loggable_type' => PurchaseOrder::class,
        ]);

        $po14Items = $po14->items()->get();

        $gr14 = $createGr(
            $po14,
            [
                $po14Items[0]->id => 100,
                $po14Items[1]->id => 30,
                $po14Items[2]->id => 200,
            ],
            $dcNth,
            'completed',
            '2026-02-25',
            'First delivery: lumber & nails full, concrete blocks partial'
        );
        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'completed',
            'from_status'   => 'pending',
            'to_status'     => 'completed',
            'loggable_id'   => $gr14->id,
            'loggable_type' => GoodsReceipt::class,
        ]);

        // ── PO 15: Draft – recently created, no action taken yet ──────────────
        // Scenario: Latest PO in the queue; still being reviewed before posting.
        $createPo([
            'vendor_id'    => $vendors->where('code', '200015')->first()->id,
            'order_date'   => '2026-03-01',
            'delivery_date'=> '2026-03-20',
            'reference_no' => 'REF-2026-015',
            'remarks'      => 'Insulation roll restock – draft under review',
        ], [
            ['material_id' => $materials->where('code', '300004')->first()->id, 'qty' => 60,  'unit_cost' => 1198.00, 'is_vatable' => true],
            ['material_id' => $materials->where('code', '300006')->first()->id, 'qty' => 300, 'unit_cost' => 44.50,   'is_vatable' => true],
        ], 'draft');
    }

    // ── Internal: complete a GR (update inventory + PO item qty_received) ─────

    private function completeGr(GoodsReceipt $gr, $user): void
    {
        foreach ($gr->items as $item) {
            $poItem = $item->purchaseOrderItem;

            // Update PO item qty_received
            $poItem->increment('qty_received', $item->qty_to_receive);

            // Upsert inventory
            $inventory = Inventory::firstOrCreate(
                [
                    'material_id' => $item->material_id,
                    'location_id' => $gr->location_id,
                ],
                [
                    'code'     => Inventory::generateCode(),
                    'quantity' => 0,
                ]
            );

            $before = (float) $inventory->quantity;
            $change = (float) $item->qty_to_receive;
            $after  = $before + $change;

            $inventory->update(['quantity' => $after]);

            InventoryLog::create([
                'movement_code'  => InventoryLog::generateMovementCode(),
                'inventory_id'   => $inventory->id,
                'material_id'    => $item->material_id,
                'location_id'    => $gr->location_id,
                'user_id'        => $user->id,
                'type'           => 'purchase_receipt',
                'quantity_before'=> $before,
                'quantity_change'=> $change,
                'quantity_after' => $after,
                'reference_id'   => $gr->id,
                'reference_type' => GoodsReceipt::class,
                'remarks'        => 'Goods receipt: ' . $gr->code,
            ]);
        }
    }
}
