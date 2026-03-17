<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGoodsReceiptRequest;
use App\Http\Requests\UpdateGoodsReceiptRequest;
use App\Models\Location;
use App\Models\GoodsReceipt;
use App\Models\GoodsReceiptItem;
use App\Models\Inventory;
use App\Models\InventoryLog;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Material;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GoodsReceiptController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:goods-receipt-view',     only: ['index', 'show']),
            new Middleware('permission:goods-receipt-create',   only: ['create', 'store']),
            new Middleware('permission:goods-receipt-edit',     only: ['edit', 'update']),
            new Middleware('permission:goods-receipt-delete',   only: ['destroy']),
            new Middleware('permission:goods-receipt-complete', only: ['complete']),
            new Middleware('permission:goods-receipt-cancel',   only: ['cancel']),
            new Middleware('permission:goods-receipt-revert',   only: ['revert']),
        ];
    }

    public function index()
    {
        $grs = GoodsReceipt::with(['purchaseOrder.vendor', 'location', 'user'])
            ->latest()
            ->get();

        return Inertia::render('purchasing/goods-receipt/index', [
            'goodsReceipts' => $grs,
        ]);
    }

    public function create(PurchaseOrder $purchaseOrder)
    {
        if (!$purchaseOrder->canCreateGr()) {
            return redirect()->route('purchase-orders.show', $purchaseOrder->id)
                ->withErrors(['error' => 'Goods receipt cannot be created for this purchase order.']);
        }

        $purchaseOrder->load([
            'vendor',
            'items.material.brand',
            'items.material.category',
            'items.material.uom',
        ]);

        return Inertia::render('purchasing/goods-receipt/create', [
            'purchaseOrder' => $purchaseOrder,
            'locations'  => Location::all(['id', 'code', 'name']),
        ]);
    }

    public function store(StoreGoodsReceiptRequest $request)
    {
        DB::transaction(function () use ($request) {
            $po = PurchaseOrder::findOrFail($request->purchase_order_id);

            $gr = GoodsReceipt::create([
                'purchase_order_id' => $po->id,
                'user_id'           => Auth::id(),
                'location_id'    => $request->location_id,
                'status'            => 'pending',
                'gr_date'           => $request->gr_date,
                'transaction_date'  => $request->transaction_date,
                'remarks'           => $request->remarks,
            ]);

            foreach ($request->items as $item) {
                $poItem      = PurchaseOrderItem::findOrFail($item['purchase_order_item_id']);
                $qtyReceived = (float) $poItem->qty_received;
                $qtyOrdered  = (float) $poItem->qty_ordered;

                $gr->items()->create([
                    'purchase_order_item_id' => $poItem->id,
                    'material_id'            => $poItem->material_id,
                    'qty_ordered'            => $qtyOrdered,
                    'qty_received'           => $qtyReceived,
                    'qty_to_receive'         => (float) $item['qty_to_receive'],
                    'qty_remaining'          => $qtyOrdered - $qtyReceived - (float) $item['qty_to_receive'],
                    'unit_cost'              => $poItem->unit_cost_after_discount,
                    'serial_number'          => $item['serial_number'] ?? null,
                    'batch_number'           => $item['batch_number'] ?? null,
                    'remarks'                => $item['remarks'] ?? null,
                ]);
            }

            $gr->logs()->create([
                'user_id'   => Auth::id(),
                'action'    => 'created',
                'to_status' => 'pending',
                'remarks'   => 'Goods receipt created',
            ]);

            $po->logs()->create([
                'user_id' => Auth::id(),
                'action'  => 'gr_created',
                'remarks' => "GR {$gr->code} created",
            ]);
        });

        return redirect()->route('goods-receipts.index')
            ->with('success', 'Goods receipt created successfully.');
    }

    public function show(GoodsReceipt $goodsReceipt)
    {
        $goodsReceipt->load([
            'purchaseOrder.vendor',
            'location',
            'user',
            'items.material',
            'items.purchaseOrderItem',
            'logs.user',
        ]);

        return Inertia::render('purchasing/goods-receipt/show', [
            'goodsReceipt' => $goodsReceipt,
        ]);
    }

    public function edit(GoodsReceipt $goodsReceipt)
    {
        if ($goodsReceipt->status !== 'pending') {
            return redirect()->route('goods-receipts.show', $goodsReceipt->id)
                ->withErrors(['error' => 'Only pending goods receipts can be edited.']);
        }

        $goodsReceipt->load([
            'purchaseOrder.vendor',
            'purchaseOrder.items.material',
            'location',
            'items.material',
            'items.purchaseOrderItem',
        ]);

        return Inertia::render('purchasing/goods-receipt/edit', [
            'goodsReceipt' => $goodsReceipt,
            'locations' => Location::all(['id', 'code', 'name']),
        ]);
    }

    public function update(UpdateGoodsReceiptRequest $request, GoodsReceipt $goodsReceipt)
    {
        if ($goodsReceipt->status !== 'pending') {
            return redirect()->route('goods-receipts.show', $goodsReceipt->id)
                ->withErrors(['error' => 'Only pending goods receipts can be edited.']);
        }

        DB::transaction(function () use ($request, $goodsReceipt) {
            $goodsReceipt->update([
                'location_id'   => $request->location_id,
                'gr_date'          => $request->gr_date,
                'transaction_date' => $request->transaction_date,
                'remarks'          => $request->remarks,
            ]);

            foreach ($request->items as $item) {
                $goodsReceipt->items()
                    ->where('purchase_order_item_id', $item['purchase_order_item_id'])
                    ->update([
                        'qty_to_receive' => $item['qty_to_receive'],
                        'serial_number'  => $item['serial_number'] ?? null,
                        'batch_number'   => $item['batch_number'] ?? null,
                        'remarks'        => $item['remarks'] ?? null,
                    ]);
            }

            $goodsReceipt->logs()->create([
                'user_id'     => Auth::id(),
                'action'      => 'updated',
                'from_status' => $goodsReceipt->status,
                'to_status'   => $goodsReceipt->status,
                'remarks'     => 'Goods receipt updated',
            ]);
        });

        return redirect()->route('goods-receipts.show', $goodsReceipt->id)
            ->with('success', 'Goods receipt updated successfully.');
    }

    public function destroy(GoodsReceipt $goodsReceipt)
    {
        if ($goodsReceipt->status !== 'pending') {
            return redirect()->route('goods-receipts.show', $goodsReceipt->id)
                ->withErrors(['error' => 'Only pending goods receipts can be deleted.']);
        }

        DB::transaction(function () use ($goodsReceipt) {
            $po = $goodsReceipt->purchaseOrder;
            $goodsReceipt->delete();

            // Recalculate PO status
            $this->recalculatePoStatus($po);
        });

        return redirect()->route('goods-receipts.index')
            ->with('success', 'Goods receipt deleted successfully.');
    }

    // ── Status Actions ────────────────────────────────────────────────────────

    public function complete(GoodsReceipt $goodsReceipt)
    {
        if (!$goodsReceipt->canBeCompleted()) {
            return back()->withErrors(['error' => 'Only pending goods receipts can be completed.']);
        }

        DB::transaction(function () use ($goodsReceipt) {
            $po = $goodsReceipt->purchaseOrder;
            $affectedMaterialIds = [];

            foreach ($goodsReceipt->items as $grItem) {
                $qtyToReceive = (float) $grItem->qty_to_receive;
                if ($qtyToReceive <= 0) continue;

                // Update PO item qty_received
                $poItem = $grItem->purchaseOrderItem;
                $newQtyReceived = (float) $poItem->qty_received + $qtyToReceive;
                $poItem->update(['qty_received' => $newQtyReceived]);

                // Update inventory
                $inventory = Inventory::withTrashed()
                    ->where('material_id', $grItem->material_id)
                    ->where('location_id', $goodsReceipt->location_id)
                    ->first();

                if ($inventory) {
                    if ($inventory->trashed()) $inventory->restore();
                    $qtyBefore = (float) $inventory->quantity;
                    $inventory->update(['quantity' => $qtyBefore + $qtyToReceive]);
                } else {
                    $qtyBefore = 0;
                    $inventory = Inventory::create([
                        'code'        => Inventory::generateCode(),
                        'material_id' => $grItem->material_id,
                        'location_id' => $goodsReceipt->location_id,
                        'quantity'    => $qtyToReceive,
                    ]);
                }

                InventoryLog::create([
                    'movement_code'   => InventoryLog::generateMovementCode(),
                    'inventory_id'    => $inventory->id,
                    'material_id'     => $grItem->material_id,
                    'location_id'     => $goodsReceipt->location_id,
                    'user_id'         => Auth::id(),
                    'type'            => 'purchase_receipt',
                    'quantity_before' => $qtyBefore,
                    'quantity_change' => $qtyToReceive,
                    'quantity_after'  => $qtyBefore + $qtyToReceive,
                    'reference_id'    => $goodsReceipt->id,
                    'reference_type'  => GoodsReceipt::class,
                    'remarks'         => "GR {$goodsReceipt->code} completed",
                ]);

                // collect affected materials
                $affectedMaterialIds[] = $grItem->material_id;
            }

            $goodsReceipt->update(['status' => 'completed']);
            $goodsReceipt->logs()->create([
                'user_id'     => Auth::id(),
                'action'      => 'completed',
                'from_status' => 'pending',
                'to_status'   => 'completed',
                'remarks'     => 'Goods receipt completed and inventory updated',
            ]);

            // Recalculate avg_unit_cost for each affected material
            foreach (array_unique($affectedMaterialIds) as $materialId) {
                $material = Material::find($materialId);
                $material?->recalculateAvgUnitCost();
            }

            $this->recalculatePoStatus($po);
        });

        return redirect()->route('goods-receipts.show', $goodsReceipt->id)
            ->with('success', 'Goods receipt completed and inventory updated.');
    }

    public function cancel(GoodsReceipt $goodsReceipt)
    {
        if (!$goodsReceipt->canBeCancelled()) {
            return back()->withErrors(['error' => 'This goods receipt cannot be cancelled.']);
        }

        DB::transaction(function () use ($goodsReceipt) {
            $fromStatus = $goodsReceipt->status;
            $po         = $goodsReceipt->purchaseOrder;

            // collect before status change
            $affectedMaterialIds = $goodsReceipt->items
                ->where('qty_to_receive', '>', 0)
                ->pluck('material_id')
                ->unique()
                ->toArray();

            // If completed, reverse inventory
            if ($fromStatus === 'completed') {
                foreach ($goodsReceipt->items as $grItem) {
                    $qtyToReverse = (float) $grItem->qty_to_receive;
                    if ($qtyToReverse <= 0) continue;

                    $inventory = Inventory::where('material_id', $grItem->material_id)
                        ->where('location_id', $goodsReceipt->location_id)
                        ->first();

                    if ($inventory) {
                        $qtyBefore = (float) $inventory->quantity;
                        $newQty    = max(0, $qtyBefore - $qtyToReverse);
                        $inventory->update(['quantity' => $newQty]);

                        InventoryLog::create([
                            'movement_code'   => InventoryLog::generateMovementCode(),
                            'inventory_id'    => $inventory->id,
                            'material_id'     => $grItem->material_id,
                            'location_id'     => $goodsReceipt->location_id,
                            'user_id'         => Auth::id(),
                            'type'            => 'purchase_return',
                            'quantity_before' => $qtyBefore,
                            'quantity_change' => -$qtyToReverse,
                            'quantity_after'  => $newQty,
                            'reference_id'    => $goodsReceipt->id,
                            'reference_type'  => GoodsReceipt::class,
                            'remarks'         => "GR {$goodsReceipt->code} cancelled - inventory reversed",
                        ]);
                    }
                }
            }

            $goodsReceipt->update(['status' => 'cancelled']);
            $goodsReceipt->logs()->create([
                'user_id'     => Auth::id(),
                'action'      => 'cancelled',
                'from_status' => $fromStatus,
                'to_status'   => 'cancelled',
                'remarks'     => $fromStatus === 'completed'
                    ? 'Goods receipt cancelled and inventory reversed'
                    : 'Goods receipt cancelled',
            ]);

            // Recalculate avg after cancel
            if ($fromStatus === 'completed') {
                foreach ($affectedMaterialIds as $materialId) {
                    $material = Material::find($materialId);
                    $material?->recalculateAvgUnitCost();
                }
            }

            $this->recalculatePoStatus($po);
        });

        return redirect()->route('goods-receipts.show', $goodsReceipt->id)
            ->with('success', 'Goods receipt cancelled.');
    }

    public function revert(GoodsReceipt $goodsReceipt)
    {
        if (!$goodsReceipt->canBeReverted()) {
            return back()->withErrors(['error' => 'Only cancelled goods receipts can be reverted to pending.']);
        }

        DB::transaction(function () use ($goodsReceipt) {
            $goodsReceipt->update(['status' => 'pending']);
            $goodsReceipt->logs()->create([
                'user_id'     => Auth::id(),
                'action'      => 'reverted',
                'from_status' => 'cancelled',
                'to_status'   => 'pending',
                'remarks'     => 'Goods receipt reverted to pending',
            ]);
        });

        return redirect()->route('goods-receipts.show', $goodsReceipt->id)
            ->with('success', 'Goods receipt reverted to pending.');
    }

    private function recalculatePoStatus(PurchaseOrder $po): void
    {
        $po->refresh();

        // Recalculate qty_received per PO item from completed GRs only
        foreach ($po->items as $poItem) {
            $totalReceived = GoodsReceiptItem::whereHas('goodsReceipt', function ($q) use ($po) {
                    $q->where('purchase_order_id', $po->id)
                        ->where('status', 'completed');
                })
                ->where('purchase_order_item_id', $poItem->id)
                ->sum('qty_to_receive');

            $poItem->update(['qty_received' => $totalReceived]);
        }

        $po->refresh();

        $allFull     = $po->items->every(fn($i) => (float)$i->qty_received >= (float)$i->qty_ordered);
        $anyReceived = $po->items->some(fn($i)  => (float)$i->qty_received > 0);

        if ($po->status === 'cancelled') return; // never touch cancelled PO

        if ($allFull) {
            $po->update(['status' => 'fully_received']);
        } elseif ($anyReceived) {
            $po->update(['status' => 'partially_received']);
        } else {
            $po->update(['status' => 'posted']);
        }

        $po->logs()->create([
            'user_id' => Auth::id(),
            'action'  => 'status_recalculated',
            'remarks' => "PO status recalculated to {$po->fresh()->status}",
        ]);
    }
}
