<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\GoodsIssue;
use App\Models\GoodsIssueItem;
use App\Models\Inventory;
use App\Models\InventoryLog;
use App\Models\Location;
use App\Models\Material;
use App\Models\SalesOrder;
use App\Models\SalesOrderItem;
use App\Models\TransactionLog;
use App\Models\User;
use Illuminate\Database\Seeder;

class SalesOrderSeeder extends Seeder
{
    public function run(): void
    {
        $user      = User::first();
        $customers = Customer::all();
        $materials = Material::where('status', 'active')->get();
        $locations = Location::all();

        $whnMnl = $locations->where('code', 'WH-MNL')->first();
        $whCeb  = $locations->where('code', 'WH-CEB')->first();
        $whDav  = $locations->where('code', 'WH-DAV')->first();
        $stBgc  = $locations->where('code', 'ST-BGC')->first();
        $stMak  = $locations->where('code', 'ST-MAK')->first();
        $dcNth  = $locations->where('code', 'DC-NTH')->first();

        // ── Helpers ────────────────────────────────────────────────────────────

        $buildSoTotals = function (array $items): array {
            $totalBefore = 0;
            $totalVat    = 0;

            foreach ($items as &$item) {
                $net = round($item['qty'] * $item['unit_price'], 2);
                $vat = $item['is_vatable'] ? round($net * 0.12, 2) : 0;

                $item['net_price']   = $net;
                $item['vat_price']   = $vat;
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

        $createSo = function (
            array $soData,
            array $rawItems,
            string $status
        ) use ($user, $buildSoTotals): SalesOrder {

            $computed = $buildSoTotals($rawItems);

            $so = SalesOrder::create([
                'customer_id'           => $soData['customer_id'],
                'user_id'               => $user->id,
                'status'                => $status,
                'order_date'            => $soData['order_date'],
                'delivery_date'         => $soData['delivery_date'] ?? null,
                'reference_no'          => $soData['reference_no']  ?? null,
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
                'remarks'               => $soData['remarks'] ?? null,
            ]);

            foreach ($computed['items'] as $line => $item) {
                SalesOrderItem::create([
                    'sales_order_id'            => $so->id,
                    'material_id'               => $item['material_id'],
                    'line_number'               => $line + 1,
                    'qty_ordered'               => $item['qty'],
                    'qty_shipped'               => $item['qty_shipped'] ?? 0,
                    'unit_price'                => $item['unit_price'],
                    'discount_type'             => null,
                    'discount_amount'           => 0,
                    'unit_price_after_discount' => $item['unit_price'],
                    'net_price'                 => $item['net_price'],
                    'is_vatable'                => $item['is_vatable'],
                    'vat_type'                  => $item['is_vatable'] ? 'inclusive' : null,
                    'vat_rate'                  => $item['is_vatable'] ? 12 : 0,
                    'vat_price'                 => $item['vat_price'],
                    'gross_price'               => $item['gross_price'],
                    'remarks'                   => $item['remarks'] ?? null,
                ]);
            }

            return $so;
        };

        $createGi = function (
            SalesOrder $so,
            array $giLines,         // [sales_order_item_id => qty_to_ship]
            Location $location,
            string $giStatus,
            string $giDate,
            string $remarks = ''
        ) use ($user): GoodsIssue {

            $gi = GoodsIssue::create([
                'sales_order_id'   => $so->id,
                'user_id'          => $user->id,
                'location_id'      => $location->id,
                'status'           => $giStatus,
                'gi_date'          => $giDate,
                'transaction_date' => $giDate,
                'remarks'          => $remarks,
            ]);

            TransactionLog::create([
                'user_id'       => $user->id,
                'action'        => 'created',
                'from_status'   => null,
                'to_status'     => 'pending',
                'loggable_id'   => $gi->id,
                'loggable_type' => GoodsIssue::class,
            ]);

            foreach ($giLines as $soItemId => $qtyToShip) {
                $soItem = SalesOrderItem::find($soItemId);

                GoodsIssueItem::create([
                    'goods_issue_id'    => $gi->id,
                    'sales_order_item_id' => $soItemId,
                    'material_id'       => $soItem->material_id,
                    'qty_ordered'       => $soItem->qty_ordered,
                    'qty_shipped'       => $soItem->qty_shipped,
                    'qty_to_ship'       => $qtyToShip,
                    'qty_remaining'     => $soItem->qty_ordered - $soItem->qty_shipped - $qtyToShip,
                    'unit_price'        => $soItem->unit_price,
                ]);
            }

            if ($giStatus === 'completed') {
                $this->completeGi($gi, $user);
            }

            if ($giStatus === 'cancelled') {
                TransactionLog::create([
                    'user_id'       => $user->id,
                    'action'        => 'cancelled',
                    'from_status'   => 'pending',
                    'to_status'     => 'cancelled',
                    'loggable_id'   => $gi->id,
                    'loggable_type' => GoodsIssue::class,
                ]);
            }

            return $gi;
        };

        // ── SO 1: Draft ────────────────────────────────────────────────────────
        // Scenario: Customer submitted a quote request; SO saved as draft, pending review.
        $createSo([
            'customer_id'  => $customers->where('code', '100001')->first()->id,
            'order_date'   => '2026-01-06',
            'delivery_date'=> '2026-01-25',
            'reference_no' => 'CUS-REF-001',
            'remarks'      => 'Draft SO for Mega Construction – awaiting price approval',
        ], [
            ['material_id' => $materials->where('code', '300001')->first()->id, 'qty' => 80,  'unit_price' => 350.00, 'is_vatable' => true],
            ['material_id' => $materials->where('code', '300002')->first()->id, 'qty' => 120, 'unit_price' => 220.00, 'is_vatable' => true],
        ], 'draft');

        // ── SO 2: Draft – multi-item ───────────────────────────────────────────
        // Scenario: Large draft order; several line items, pending management sign-off.
        $createSo([
            'customer_id'  => $customers->where('code', '100002')->first()->id,
            'order_date'   => '2026-01-09',
            'delivery_date'=> '2026-01-30',
            'reference_no' => 'CUS-REF-002',
            'remarks'      => 'Prime Builders – bulk order draft',
        ], [
            ['material_id' => $materials->where('code', '300003')->first()->id, 'qty' => 40,  'unit_price' => 850.00, 'is_vatable' => true],
            ['material_id' => $materials->where('code', '300005')->first()->id, 'qty' => 30,  'unit_price' => 1100.00,'is_vatable' => true],
            ['material_id' => $materials->where('code', '300007')->first()->id, 'qty' => 100, 'unit_price' => 165.00, 'is_vatable' => false],
        ], 'draft');

        // ── SO 3: Posted – awaiting GI ────────────────────────────────────────
        // Scenario: SO confirmed and posted; warehouse preparing for dispatch.
        $so3 = $createSo([
            'customer_id'  => $customers->where('code', '100003')->first()->id,
            'order_date'   => '2026-01-12',
            'delivery_date'=> '2026-02-01',
            'reference_no' => 'CUS-REF-003',
            'remarks'      => 'Urban Dev – posted, awaiting warehouse dispatch',
        ], [
            ['material_id' => $materials->where('code', '300006')->first()->id, 'qty' => 200, 'unit_price' => 65.00,   'is_vatable' => true],
            ['material_id' => $materials->where('code', '300004')->first()->id, 'qty' => 20,  'unit_price' => 1600.00, 'is_vatable' => true],
        ], 'posted');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $so3->id,
            'loggable_type' => SalesOrder::class,
        ]);

        // ── SO 4: Posted – another open SO ────────────────────────────────────
        // Scenario: Confirmed SO; customer requested delivery in two weeks.
        $so4 = $createSo([
            'customer_id'  => $customers->where('code', '100004')->first()->id,
            'order_date'   => '2026-01-15',
            'delivery_date'=> '2026-02-08',
            'reference_no' => 'CUS-REF-004',
        ], [
            ['material_id' => $materials->where('code', '300001')->first()->id, 'qty' => 60, 'unit_price' => 350.00, 'is_vatable' => true],
            ['material_id' => $materials->where('code', '300008')->first()->id, 'qty' => 10, 'unit_price' => 1000.00,'is_vatable' => false],
        ], 'posted');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $so4->id,
            'loggable_type' => SalesOrder::class,
        ]);

        // ── SO 5: Partially shipped – first GI done ────────────────────────────
        // Scenario: Customer ordered 150 steel rods; 80 shipped in first GI, 70 pending.
        $so5 = $createSo([
            'customer_id'  => $customers->where('code', '100005')->first()->id,
            'order_date'   => '2026-01-16',
            'delivery_date'=> '2026-02-10',
            'reference_no' => 'CUS-REF-005',
            'remarks'      => 'Heritage Homes – split delivery per site schedule',
        ], [
            ['material_id'  => $materials->where('code', '300001')->first()->id,
             'qty'          => 150,
             'unit_price'   => 350.00,
             'is_vatable'   => true,
             'qty_shipped'  => 80],
            ['material_id'  => $materials->where('code', '300012')->first()->id,
             'qty'          => 15,
             'unit_price'   => 780.00,
             'is_vatable'   => false,
             'qty_shipped'  => 15],
        ], 'partially_shipped');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $so5->id,
            'loggable_type' => SalesOrder::class,
        ]);

        $so5Items = $so5->items()->get();

        $gi5 = $createGi(
            $so5,
            [
                $so5Items[0]->id => 80,   // partial on steel rods
                $so5Items[1]->id => 15,   // full on sand
            ],
            $whnMnl,
            'completed',
            '2026-01-28',
            'First shipment – 80 rods and full sand delivery'
        );

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'completed',
            'from_status'   => 'pending',
            'to_status'     => 'completed',
            'loggable_id'   => $gi5->id,
            'loggable_type' => GoodsIssue::class,
        ]);

        // ── SO 6: Fully shipped – single GI ───────────────────────────────────
        // Scenario: Complete order shipped in one go from Manila Warehouse.
        $so6 = $createSo([
            'customer_id'  => $customers->where('code', '100006')->first()->id,
            'order_date'   => '2026-01-20',
            'delivery_date'=> '2026-02-06',
            'reference_no' => 'CUS-REF-006',
            'remarks'      => 'Coastal Realty – single delivery, full order',
        ], [
            ['material_id'  => $materials->where('code', '300006')->first()->id,
             'qty'          => 300,
             'unit_price'   => 65.00,
             'is_vatable'   => true,
             'qty_shipped'  => 300],
        ], 'fully_shipped');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $so6->id,
            'loggable_type' => SalesOrder::class,
        ]);

        $so6Items = $so6->items()->get();

        $gi6 = $createGi(
            $so6,
            [$so6Items[0]->id => 300],
            $whnMnl,
            'completed',
            '2026-02-05',
            'Full tile shipment – 300 pcs dispatched'
        );
        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'completed',
            'from_status'   => 'pending',
            'to_status'     => 'completed',
            'loggable_id'   => $gi6->id,
            'loggable_type' => GoodsIssue::class,
        ]);

        // ── SO 7: Fully shipped – two GIs ─────────────────────────────────────
        // Scenario: Large PVC order; delivered to site in two truck runs.
        $so7 = $createSo([
            'customer_id'  => $customers->where('code', '100007')->first()->id,
            'order_date'   => '2026-01-22',
            'delivery_date'=> '2026-02-15',
            'reference_no' => 'CUS-REF-007',
            'remarks'      => 'Metro Housing – PVC delivered in 2 trips',
        ], [
            ['material_id'  => $materials->where('code', '300007')->first()->id,
             'qty'          => 200,
             'unit_price'   => 165.00,
             'is_vatable'   => true,
             'qty_shipped'  => 200],
        ], 'fully_shipped');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $so7->id,
            'loggable_type' => SalesOrder::class,
        ]);

        $so7Items = $so7->items()->get();

        $gi7a = $createGi(
            $so7,
            [$so7Items[0]->id => 100],
            $whDav,
            'completed',
            '2026-02-08',
            'Trip 1 – 100 PVC pipes dispatched to site'
        );
        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'completed',
            'from_status'   => 'pending',
            'to_status'     => 'completed',
            'loggable_id'   => $gi7a->id,
            'loggable_type' => GoodsIssue::class,
        ]);

        $so7Items[0]->refresh();
        $gi7b = $createGi(
            $so7,
            [$so7Items[0]->id => 100],
            $whDav,
            'completed',
            '2026-02-15',
            'Trip 2 – remaining 100 PVC pipes delivered'
        );
        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'completed',
            'from_status'   => 'pending',
            'to_status'     => 'completed',
            'loggable_id'   => $gi7b->id,
            'loggable_type' => GoodsIssue::class,
        ]);

        // ── SO 8: Partially shipped – pending GI still open ───────────────────
        // Scenario: First GI completed; second GI created but still pending.
        $so8 = $createSo([
            'customer_id'  => $customers->where('code', '100008')->first()->id,
            'order_date'   => '2026-01-25',
            'delivery_date'=> '2026-02-20',
            'reference_no' => 'CUS-REF-008',
            'remarks'      => 'Provincial Builders – paint batch delivery',
        ], [
            ['material_id'  => $materials->where('code', '300004')->first()->id,
             'qty'          => 50,
             'unit_price'   => 1600.00,
             'is_vatable'   => true,
             'qty_shipped'  => 25],
        ], 'partially_shipped');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $so8->id,
            'loggable_type' => SalesOrder::class,
        ]);

        $so8Items = $so8->items()->get();

        $gi8Completed = $createGi(
            $so8,
            [$so8Items[0]->id => 25],
            $stBgc,
            'completed',
            '2026-02-10',
            'First batch – 25 paint cans dispatched from BGC store'
        );
        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'completed',
            'from_status'   => 'pending',
            'to_status'     => 'completed',
            'loggable_id'   => $gi8Completed->id,
            'loggable_type' => GoodsIssue::class,
        ]);

        $so8Items[0]->refresh();
        // Second GI – pending; customer site not ready yet
        $createGi(
            $so8,
            [$so8Items[0]->id => 25],
            $stBgc,
            'pending',
            '2026-02-20',
            'Second batch – pending customer site clearance'
        );

        // ── SO 9: Cancelled – before any GI ───────────────────────────────────
        // Scenario: Customer cancelled their project; SO voided with no stock movement.
        $so9 = $createSo([
            'customer_id'  => $customers->where('code', '100009')->first()->id,
            'order_date'   => '2026-01-28',
            'delivery_date'=> '2026-02-22',
            'reference_no' => 'CUS-REF-009',
            'remarks'      => 'Summit Construction – project cancelled by client',
        ], [
            ['material_id' => $materials->where('code', '300010')->first()->id, 'qty' => 20, 'unit_price' => 1650.00, 'is_vatable' => true],
            ['material_id' => $materials->where('code', '300009')->first()->id, 'qty' => 15, 'unit_price' => 2400.00, 'is_vatable' => true],
        ], 'cancelled');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $so9->id,
            'loggable_type' => SalesOrder::class,
        ]);
        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'cancelled',
            'from_status'   => 'posted',
            'to_status'     => 'cancelled',
            'remarks'       => 'Customer project on hold; order voided',
            'loggable_id'   => $so9->id,
            'loggable_type' => SalesOrder::class,
        ]);

        // ── SO 10: Cancelled – GI was completed then SO cancelled ──────────────
        // Scenario: Partial shipment made; customer later cancelled remaining; SO closed.
        $so10 = $createSo([
            'customer_id'  => $customers->where('code', '100010')->first()->id,
            'order_date'   => '2026-02-01',
            'delivery_date'=> '2026-02-18',
            'reference_no' => 'CUS-REF-010',
            'remarks'      => 'Landmark Dev – partial shipment done, rest cancelled',
        ], [
            ['material_id'  => $materials->where('code', '300011')->first()->id,
             'qty'          => 300,
             'unit_price'   => 38.00,
             'is_vatable'   => false,
             'qty_shipped'  => 120],
        ], 'cancelled');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $so10->id,
            'loggable_type' => SalesOrder::class,
        ]);

        $so10Items = $so10->items()->get();

        $gi10 = $createGi(
            $so10,
            [$so10Items[0]->id => 120],
            $dcNth,
            'completed',
            '2026-02-10',
            'Partial block delivery – 120 of 300 shipped'
        );
        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'completed',
            'from_status'   => 'pending',
            'to_status'     => 'completed',
            'loggable_id'   => $gi10->id,
            'loggable_type' => GoodsIssue::class,
        ]);

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'cancelled',
            'from_status'   => 'partially_shipped',
            'to_status'     => 'cancelled',
            'remarks'       => 'Remaining quantity cancelled – customer revised scope',
            'loggable_id'   => $so10->id,
            'loggable_type' => SalesOrder::class,
        ]);

        // ── SO 11: GI created then cancelled, SO back to posted ───────────────
        // Scenario: GI was entered with wrong quantities; cancelled; SO remains posted.
        $so11 = $createSo([
            'customer_id'  => $customers->where('code', '100011')->first()->id,
            'order_date'   => '2026-02-04',
            'delivery_date'=> '2026-02-22',
            'reference_no' => 'CUS-REF-011',
            'remarks'      => 'Pacific Estates – GI cancelled due to wrong qty entry',
        ], [
            ['material_id' => $materials->where('code', '300005')->first()->id, 'qty' => 50, 'unit_price' => 1100.00, 'is_vatable' => true],
        ], 'posted');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $so11->id,
            'loggable_type' => SalesOrder::class,
        ]);

        $so11Items = $so11->items()->get();

        $gi11 = $createGi(
            $so11,
            [$so11Items[0]->id => 50],
            $stMak,
            'cancelled',
            '2026-02-15',
            'Cancelled – incorrect qty; to be re-processed'
        );

        // ── SO 12: Fully shipped – BGC store, multi-item ──────────────────────
        // Scenario: Walk-in bulk order fulfilled entirely from BGC store stock.
        $so12 = $createSo([
            'customer_id'  => $customers->where('code', '100012')->first()->id,
            'order_date'   => '2026-02-06',
            'delivery_date'=> '2026-02-20',
            'reference_no' => 'CUS-REF-012',
            'remarks'      => 'Green Valley – full order from BGC store',
        ], [
            ['material_id'  => $materials->where('code', '300004')->first()->id,
             'qty'          => 10,
             'unit_price'   => 1600.00,
             'is_vatable'   => true,
             'qty_shipped'  => 10],
            ['material_id'  => $materials->where('code', '300010')->first()->id,
             'qty'          => 8,
             'unit_price'   => 1650.00,
             'is_vatable'   => true,
             'qty_shipped'  => 8],
        ], 'fully_shipped');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $so12->id,
            'loggable_type' => SalesOrder::class,
        ]);

        $so12Items = $so12->items()->get();

        $gi12 = $createGi(
            $so12,
            [
                $so12Items[0]->id => 10,
                $so12Items[1]->id => 8,
            ],
            $stBgc,
            'completed',
            '2026-02-18',
            'Full shipment – paint & glass panels from BGC'
        );
        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'completed',
            'from_status'   => 'pending',
            'to_status'     => 'completed',
            'loggable_id'   => $gi12->id,
            'loggable_type' => GoodsIssue::class,
        ]);

        // ── SO 13: Posted – no delivery date, open-ended ──────────────────────
        // Scenario: SO confirmed but delivery date flexible per customer request.
        $so13 = $createSo([
            'customer_id'  => $customers->where('code', '100013')->first()->id,
            'order_date'   => '2026-02-10',
            'delivery_date'=> null,
            'reference_no' => 'CUS-REF-013',
            'remarks'      => 'Elite Property – delivery date TBD',
        ], [
            ['material_id' => $materials->where('code', '300002')->first()->id, 'qty' => 100, 'unit_price' => 220.00, 'is_vatable' => true],
            ['material_id' => $materials->where('code', '300008')->first()->id, 'qty' => 8,   'unit_price' => 1000.00,'is_vatable' => false],
        ], 'posted');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $so13->id,
            'loggable_type' => SalesOrder::class,
        ]);

        // ── SO 14: Partially shipped – three-item, two shipped, one partial ────
        // Scenario: Lumber and nails fully dispatched; cement only half out.
        $so14 = $createSo([
            'customer_id'  => $customers->where('code', '100011')->first()->id,
            'order_date'   => '2026-02-13',
            'delivery_date'=> '2026-03-05',
            'reference_no' => 'CUS-REF-014',
            'remarks'      => 'Prestige Homes – mixed dispatch schedule',
        ], [
            ['material_id'  => $materials->where('code', '300014')->first()->id,
             'qty'          => 80,
             'unit_price'   => 320.00,
             'is_vatable'   => true,
             'qty_shipped'  => 80],
            ['material_id'  => $materials->where('code', '300013')->first()->id,
             'qty'          => 20,
             'unit_price'   => 240.00,
             'is_vatable'   => false,
             'qty_shipped'  => 20],
            ['material_id'  => $materials->where('code', '300002')->first()->id,
             'qty'          => 150,
             'unit_price'   => 220.00,
             'is_vatable'   => true,
             'qty_shipped'  => 60],
        ], 'partially_shipped');

        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'posted',
            'from_status'   => 'draft',
            'to_status'     => 'posted',
            'loggable_id'   => $so14->id,
            'loggable_type' => SalesOrder::class,
        ]);

        $so14Items = $so14->items()->get();

        $gi14 = $createGi(
            $so14,
            [
                $so14Items[0]->id => 80,
                $so14Items[1]->id => 20,
                $so14Items[2]->id => 60,
            ],
            $whCeb,
            'completed',
            '2026-02-26',
            'First dispatch – lumber & nails full, cement partial'
        );
        TransactionLog::create([
            'user_id'       => $user->id,
            'action'        => 'completed',
            'from_status'   => 'pending',
            'to_status'     => 'completed',
            'loggable_id'   => $gi14->id,
            'loggable_type' => GoodsIssue::class,
        ]);

        // ── SO 15: Draft – newest, not yet posted ─────────────────────────────
        // Scenario: Most recent SO; just created, pending management review.
        $createSo([
            'customer_id'  => $customers->where('code', '100015')->first()->id,
            'order_date'   => '2026-03-02',
            'delivery_date'=> '2026-03-25',
            'reference_no' => 'CUS-REF-015',
            'remarks'      => 'Horizon Real Estate – new draft, under review',
        ], [
            ['material_id' => $materials->where('code', '300003')->first()->id, 'qty' => 30,  'unit_price' => 850.00,  'is_vatable' => true],
            ['material_id' => $materials->where('code', '300006')->first()->id, 'qty' => 500, 'unit_price' => 65.00,   'is_vatable' => true],
            ['material_id' => $materials->where('code', '300007')->first()->id, 'qty' => 80,  'unit_price' => 165.00,  'is_vatable' => false],
        ], 'draft');
    }

    // ── Internal: complete a GI (deduct inventory + update SO item qty_shipped) ─

    private function completeGi(GoodsIssue $gi, $user): void
    {
        foreach ($gi->items as $item) {
            $soItem = $item->salesOrderItem;

            // Update SO item qty_shipped
            $soItem->increment('qty_shipped', $item->qty_to_ship);

            // Deduct inventory
            $inventory = Inventory::where('material_id', $item->material_id)
                ->where('location_id', $gi->location_id)
                ->first();

            if (!$inventory) {
                // Guard – shouldn't happen in a properly seeded environment
                continue;
            }

            $before = (float) $inventory->quantity;
            $change = (float) $item->qty_to_ship;
            $after  = max(0, $before - $change);

            $inventory->update(['quantity' => $after]);

            InventoryLog::create([
                'movement_code'  => InventoryLog::generateMovementCode(),
                'inventory_id'   => $inventory->id,
                'material_id'    => $item->material_id,
                'location_id'    => $gi->location_id,
                'user_id'        => $user->id,
                'type'           => 'sales_issue',
                'quantity_before'=> $before,
                'quantity_change'=> -$change,
                'quantity_after' => $after,
                'reference_id'   => $gi->id,
                'reference_type' => GoodsIssue::class,
                'remarks'        => 'Goods issue: ' . $gi->code,
            ]);
        }
    }
}
