<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePurchaseOrderRequest;
use App\Http\Requests\UpdatePurchaseOrderRequest;
use App\Models\Charge;
use App\Models\Vendor;
use App\Models\Material;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\GoodsReceipt;
use App\Models\Inventory;
use App\Models\InventoryLog;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PurchaseOrderController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:purchase-order-view',     only: ['index', 'show']),
            new Middleware('permission:purchase-order-create',   only: ['create', 'store']),
            new Middleware('permission:purchase-order-edit',     only: ['edit', 'update']),
            new Middleware('permission:purchase-order-delete',   only: ['destroy']),
            new Middleware('permission:purchase-order-post',     only: ['post']),
            new Middleware('permission:purchase-order-cancel',   only: ['cancel']),
            new Middleware('permission:purchase-order-revert',   only: ['revert']),
        ];
    }

    public function index()
    {
        $pos = PurchaseOrder::with(['vendor', 'user'])
            ->latest()
            ->paginate(10);

        return Inertia::render('purchasing/purchase-order/index', [
            'purchaseOrders' => $pos,
        ]);
    }

    public function create()
    {
        $vendors   = Vendor::where('status', 'active')->get();
        $materials = Material::where('status', 'active')
            ->with(['brand', 'category', 'uom'])
            ->get();
        $charges   = Charge::where('status', 'active')->get();

        return Inertia::render('purchasing/purchase-order/create', [
            'vendors'   => $vendors,
            'materials' => $materials,
            'charges'   => $charges,
        ]);
    }

    public function store(StorePurchaseOrderRequest $request)
    {
        DB::transaction(function () use ($request) {
            $po = PurchaseOrder::create([
                'vendor_id'     => $request->vendor_id,
                'user_id'       => Auth::id(),
                'status'        => 'draft',
                'order_date'    => $request->order_date,
                'delivery_date' => $request->delivery_date,
                'reference_no'  => $request->reference_no,
                'discount_type' => $request->discount_type,
                'discount_amount' => $request->discount_amount ?? 0,
                'remarks'       => $request->remarks,
            ]);

            $this->syncItems($po, $request->items);
            $this->syncCharges($po, $request->charges ?? []);
            $this->recalculateTotals($po);

            $po->logs()->create([
                'user_id' => Auth::id(),
                'action'  => 'created',
                'to_status' => 'draft',
                'remarks' => 'Purchase order created',
            ]);
        });

        return redirect()->route('purchase-orders.index')
            ->with('success', 'Purchase order created successfully.');
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load([
            'vendor', 'user',
            'items.material',
            'charges.charge',
            'goodsReceipts.location',
            'goodsReceipts.user',
            'logs.user',
        ]);

        return Inertia::render('purchasing/purchase-order/show', [
            'purchaseOrder' => $purchaseOrder,
        ]);
    }

    public function edit(PurchaseOrder $purchaseOrder)
    {
        if (!$purchaseOrder->canBeEdited()) {
            return redirect()->route('purchase-orders.show', $purchaseOrder->id)
                ->withErrors(['error' => 'Only draft purchase orders can be edited.']);
        }

        $vendors   = Vendor::where('status', 'active')->get();
        $materials = Material::where('status', 'active')
            ->with(['brand', 'category', 'uom'])
            ->get();
        $charges   = Charge::where('status', 'active')->get();

        $purchaseOrder->load(['vendor', 'items.material', 'charges']);

        return Inertia::render('purchasing/purchase-order/edit', [
            'purchaseOrder' => $purchaseOrder,
            'vendors'       => $vendors,
            'materials'     => $materials,
            'charges'       => $charges,
        ]);
    }

    public function update(UpdatePurchaseOrderRequest $request, PurchaseOrder $purchaseOrder)
    {
        if (!$purchaseOrder->canBeEdited()) {
            return redirect()->route('purchase-orders.show', $purchaseOrder->id)
                ->withErrors(['error' => 'Only draft purchase orders can be edited.']);
        }

        DB::transaction(function () use ($request, $purchaseOrder) {
            $purchaseOrder->update([
                'vendor_id'       => $request->vendor_id,
                'order_date'      => $request->order_date,
                'delivery_date'   => $request->delivery_date,
                'reference_no'    => $request->reference_no,
                'discount_type'   => $request->discount_type,
                'discount_amount' => $request->discount_amount ?? 0,
                'remarks'         => $request->remarks,
            ]);

            $this->syncItems($purchaseOrder, $request->items);
            $this->syncCharges($purchaseOrder, $request->charges ?? []);
            $this->recalculateTotals($purchaseOrder);

            $purchaseOrder->logs()->create([
                'user_id'     => Auth::id(),
                'action'      => 'updated',
                'from_status' => $purchaseOrder->status,
                'to_status'   => $purchaseOrder->status,
                'remarks'     => 'Purchase order updated',
            ]);
        });

        return redirect()->route('purchase-orders.show', $purchaseOrder->id)
            ->with('success', 'Purchase order updated successfully.');
    }

    public function destroy(PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->status !== 'draft') {
            return redirect()->route('purchase-orders.index')
                ->withErrors(['error' => 'Only draft purchase orders can be deleted.']);
        }

        DB::transaction(function () use ($purchaseOrder) {
            // Delete all pending GRs (draft PO can only have pending GRs)
            foreach ($purchaseOrder->goodsReceipts as $gr) {
                $gr->items()->delete();
                $gr->logs()->delete();
                $gr->delete();
            }

            $purchaseOrder->delete();
        });

        return redirect()->route('purchase-orders.index')
            ->with('success', 'Purchase order deleted successfully.');
    }

    // ── Status Actions ────────────────────────────────────────────────────────

    public function post(PurchaseOrder $purchaseOrder)
    {
        if (!$purchaseOrder->canBePosted()) {
            return back()->withErrors(['error' => 'Purchase order cannot be posted.']);
        }

        DB::transaction(function () use ($purchaseOrder) {
            $purchaseOrder->update(['status' => 'posted']);
            $purchaseOrder->logs()->create([
                'user_id'     => Auth::id(),
                'action'      => 'posted',
                'from_status' => 'draft',
                'to_status'   => 'posted',
                'remarks'     => 'Purchase order posted',
            ]);
        });

        return redirect()->route('purchase-orders.show', $purchaseOrder->id)
            ->with('success', 'Purchase order posted successfully.');
    }

    public function cancel(PurchaseOrder $purchaseOrder)
    {
        if (!$purchaseOrder->canBeCancelled()) {
            return back()->withErrors(['error' => 'Purchase order cannot be cancelled.']);
        }

        DB::transaction(function () use ($purchaseOrder) {
            $fromStatus = $purchaseOrder->status;

            // Cancel all non-cancelled GRs
            foreach ($purchaseOrder->goodsReceipts()->whereNotIn('status', ['cancelled'])->get() as $gr) {
                $grFromStatus = $gr->status;

                // Reverse inventory if completed
                if ($grFromStatus === 'completed') {
                    foreach ($gr->items as $grItem) {
                        $qtyToReverse = (float) $grItem->qty_to_receive;
                        if ($qtyToReverse <= 0) continue;

                        $inventory = Inventory::where('material_id', $grItem->material_id)
                            ->where('location_id', $gr->location_id)
                            ->first();

                        if ($inventory) {
                            $qtyBefore = (float) $inventory->quantity;
                            $newQty    = max(0, $qtyBefore - $qtyToReverse);
                            $inventory->update(['quantity' => $newQty]);

                            InventoryLog::create([
                                'movement_code'   => InventoryLog::generateMovementCode(),
                                'inventory_id'    => $inventory->id,
                                'material_id'     => $grItem->material_id,
                                'location_id'     => $gr->location_id,
                                'user_id'         => Auth::id(),
                                'type'            => 'purchase_return',
                                'quantity_before' => $qtyBefore,
                                'quantity_change' => -$qtyToReverse,
                                'quantity_after'  => $newQty,
                                'reference_id'    => $gr->id,
                                'reference_type'  => GoodsReceipt::class,
                                'remarks'         => "GR {$gr->code} cancelled via PO cancellation",
                            ]);
                        }
                    }

                    // Recalculate avg unit cost
                    foreach ($gr->items->pluck('material_id')->unique() as $materialId) {
                        Material::find($materialId)?->recalculateAvgUnitCost();
                    }
                }

                $gr->update(['status' => 'cancelled']);
                $gr->logs()->create([
                    'user_id'     => Auth::id(),
                    'action'      => 'cancelled',
                    'from_status' => $grFromStatus,
                    'to_status'   => 'cancelled',
                    'remarks'     => "Cancelled via PO {$purchaseOrder->code} cancellation",
                ]);
            }

            $purchaseOrder->update(['status' => 'cancelled']);
            $purchaseOrder->logs()->create([
                'user_id'     => Auth::id(),
                'action'      => 'cancelled',
                'from_status' => $fromStatus,
                'to_status'   => 'cancelled',
                'remarks'     => 'Purchase order cancelled',
            ]);
        });

        return redirect()->route('purchase-orders.show', $purchaseOrder->id)
            ->with('success', 'Purchase order and all related goods receipts cancelled.');
    }

    public function revert(PurchaseOrder $purchaseOrder)
    {
        if (!in_array($purchaseOrder->status, ['posted', 'cancelled'])) {
            return back()->withErrors(['error' => 'Only posted or cancelled purchase orders can be reverted to draft.']);
        }

        DB::transaction(function () use ($purchaseOrder) {
            $fromStatus = $purchaseOrder->status;

            // Revert all cancelled GRs back to pending
            foreach ($purchaseOrder->goodsReceipts()->where('status', 'cancelled')->get() as $gr) {
                $gr->update(['status' => 'pending']);
                $gr->logs()->create([
                    'user_id'     => Auth::id(),
                    'action'      => 'reverted',
                    'from_status' => 'cancelled',
                    'to_status'   => 'pending',
                    'remarks'     => "Reverted to pending via PO {$purchaseOrder->code} revert",
                ]);
            }

            $purchaseOrder->update(['status' => 'draft']);
            $purchaseOrder->logs()->create([
                'user_id'     => Auth::id(),
                'action'      => 'reverted',
                'from_status' => $fromStatus,
                'to_status'   => 'draft',
                'remarks'     => 'Purchase order reverted to draft',
            ]);
        });

        return redirect()->route('purchase-orders.show', $purchaseOrder->id)
            ->with('success', 'Purchase order reverted to draft and all related goods receipts reverted to pending.');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function syncItems(PurchaseOrder $po, array $items): void
    {
        $po->items()->delete();

        foreach ($items as $index => $item) {
            $unitCost     = (float) $item['unit_cost'];
            $qty           = (float) $item['qty_ordered'];
            $discountType  = $item['discount_type'] ?? null;
            $discountAmt   = (float) ($item['discount_amount'] ?? 0);
            $isVatable     = (bool) ($item['is_vatable'] ?? false);
            $vatType       = $item['vat_type'] ?? 'exclusive';
            $vatRate       = (float) ($item['vat_rate'] ?? 12);

            // Unit price after discount
            $unitAfterDiscount = $unitCost;
            if ($discountType === 'fixed') {
                $unitAfterDiscount = max(0, $unitCost - $discountAmt);
            } elseif ($discountType === 'percentage') {
                $unitAfterDiscount = $unitCost * (1 - ($discountAmt / 100));
            }

            // Net price
            $netPrice = $unitAfterDiscount * $qty;

            // VAT
            $vatPrice = 0;
            if ($isVatable) {
                if ($vatType === 'exclusive') {
                    $vatPrice = $netPrice * ($vatRate / 100);
                } else {
                    // inclusive: extract VAT from net
                    $vatPrice = $netPrice - ($netPrice / (1 + ($vatRate / 100)));
                }
            }

            $grossPrice = $netPrice + ($vatType === 'exclusive' ? $vatPrice : 0);

            $po->items()->create([
                'material_id'               => $item['material_id'],
                'line_number'               => $index + 1,
                'qty_ordered'               => $qty,
                'qty_received'              => 0,
                'unit_cost'                => $unitCost,
                'discount_type'             => $discountType,
                'discount_amount'           => $discountAmt,
                'unit_cost_after_discount' => $unitAfterDiscount,
                'net_price'                 => $netPrice,
                'is_vatable'                => $isVatable,
                'vat_type'                  => $vatType,
                'vat_rate'                  => $vatRate,
                'vat_price'                 => $vatPrice,
                'gross_price'               => $grossPrice,
                'remarks'                   => $item['remarks'] ?? null,
            ]);
        }
    }

    private function syncCharges(PurchaseOrder $po, array $charges): void
    {
        $po->charges()->delete();

        foreach ($charges as $chargeData) {
            $charge = Charge::find($chargeData['charge_id']);
            if (!$charge) continue;

            $po->charges()->create([
                'charge_id'       => $charge->id,
                'name'            => $charge->name,
                'type'            => $charge->type,
                'value_type'      => $charge->value_type,
                'value'           => $charge->value,
                'computed_amount' => 0, // recalculated in recalculateTotals
            ]);
        }
    }

    private function recalculateTotals(PurchaseOrder $po): void
    {
        $po->refresh();
        $items = $po->items;

        $totalBeforeDiscount = $items->sum(fn($i) => (float)$i->unit_price * (float)$i->qty_ordered);
        $totalItemDiscount   = $items->sum(fn($i) => ((float)$i->unit_price - (float)$i->unit_price_after_discount) * (float)$i->qty_ordered);
        $totalNetPrice       = $items->sum(fn($i) => (float)$i->net_price);
        $totalVat            = $items->sum(fn($i) => (float)$i->vat_price);
        $totalGross          = $items->sum(fn($i) => (float)$i->gross_price);

        // Header discount
        $headerDiscountTotal = 0;
        if ($po->discount_type === 'fixed') {
            $headerDiscountTotal = (float) $po->discount_amount;
        } elseif ($po->discount_type === 'percentage') {
            $headerDiscountTotal = $totalGross * ((float)$po->discount_amount / 100);
        }

        $afterHeaderDiscount = $totalGross - $headerDiscountTotal;

        // Charges
        $totalCharges = 0;
        foreach ($po->charges as $poCharge) {
            $computed = $poCharge->value_type === 'fixed'
                ? (float) $poCharge->value
                : $afterHeaderDiscount * ((float)$poCharge->value / 100);

            $poCharge->update(['computed_amount' => $computed]);

            if ($poCharge->type === 'tax') {
                $totalCharges += $computed;
            } else {
                $totalCharges -= $computed;
            }
        }

        $grandTotal = $afterHeaderDiscount + $totalCharges;

        $po->update([
            'total_before_discount' => $totalBeforeDiscount,
            'total_item_discount'   => $totalItemDiscount,
            'total_net_price'       => $totalNetPrice,
            'total_vat'             => $totalVat,
            'total_gross'           => $totalGross,
            'header_discount_total' => $headerDiscountTotal,
            'total_charges'         => $totalCharges,
            'grand_total'           => $grandTotal,
        ]);
    }
}
