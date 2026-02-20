<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGoodsReceiptRequest;
use App\Http\Requests\UpdateGoodsReceiptRequest;
use App\Models\Destination;
use App\Models\GoodsReceipt;
use App\Models\GoodsReceiptItem;
use App\Models\Inventory;
use App\Models\InventoryLog;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
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
            new Middleware('permission:gr-view',     only: ['index', 'show']),
            new Middleware('permission:gr-create',   only: ['create', 'store']),
            new Middleware('permission:gr-edit',     only: ['edit', 'update']),
            new Middleware('permission:gr-delete', only: ['destroy']),
            new Middleware('permission:gr-complete', only: ['complete']),
            new Middleware('permission:gr-cancel',   only: ['cancel']),
            new Middleware('permission:gr-revert',   only: ['revert']),
        ];
    }

    public function index()
    {
        $grs = GoodsReceipt::with(['purchaseOrder.vendor', 'destination', 'user'])
            ->latest()
            ->paginate(10);

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
            'destinations'  => Destination::all(['id', 'code', 'name']),
        ]);
    }

    public function store(StoreGoodsReceiptRequest $request)
    {
        DB::transaction(function () use ($request) {
            $po = PurchaseOrder::findOrFail($request->purchase_order_id);

            $gr = GoodsReceipt::create([
                'purchase_order_id' => $po->id,
                'user_id'           => Auth::id(),
                'destination_id'    => $request->destination_id,
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
                    'unit_cost'              => $poItem->unit_price_after_discount,
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
                'remarks' => "GR {$gr->gr_number} created",
            ]);
        });

        return redirect()->route('goods-receipts.index')
            ->with('success', 'Goods receipt created successfully.');
    }

    public function show(GoodsReceipt $goodsReceipt)
    {
        $goodsReceipt->load([
            'purchaseOrder.vendor',
            'destination',
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
            'destination',
            'items.material',
            'items.purchaseOrderItem',
        ]);

        return Inertia::render('purchasing/goods-receipt/edit', [
            'goodsReceipt' => $goodsReceipt,
            'destinations' => Destination::all(['id', 'code', 'name']),
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
                'destination_id'   => $request->destination_id,
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
        if (!in_array($goodsReceipt->status, ['pending', 'partially_received'])) {
            return back()->withErrors(['error' => 'Goods receipt cannot be completed.']);
        }

        DB::transaction(function () use ($goodsReceipt) {
            $fromStatus = $goodsReceipt->status;
            $po         = $goodsReceipt->purchaseOrder;
            $allFull    = true;

            foreach ($goodsReceipt->items as $grItem) {
                $qtyToReceive = (float) $grItem->qty_to_receive;

                if ($qtyToReceive <= 0) continue;

                // Update PO item qty_received
                $poItem = $grItem->purchaseOrderItem;
                $newQtyReceived = (float) $poItem->qty_received + $qtyToReceive;
                $poItem->update(['qty_received' => $newQtyReceived]);

                if ($newQtyReceived < (float) $poItem->qty_ordered) {
                    $allFull = false;
                }

                // Update inventory
                $inventory = Inventory::withTrashed()
                    ->where('material_id', $grItem->material_id)
                    ->where('destination_id', $goodsReceipt->destination_id)
                    ->first();

                if ($inventory) {
                    if ($inventory->trashed()) $inventory->restore();
                    $qtyBefore = (float) $inventory->quantity;
                    $inventory->update(['quantity' => $qtyBefore + $qtyToReceive]);
                } else {
                    $qtyBefore = 0;
                    $inventory = Inventory::create([
                        'code'           => Inventory::generateCode(),
                        'material_id'    => $grItem->material_id,
                        'destination_id' => $goodsReceipt->destination_id,
                        'quantity'       => $qtyToReceive,
                    ]);
                }

                // Inventory log
                InventoryLog::create([
                    'movement_code'   => InventoryLog::generateMovementCode(),
                    'inventory_id'    => $inventory->id,
                    'material_id'     => $grItem->material_id,
                    'destination_id'  => $goodsReceipt->destination_id,
                    'user_id'         => Auth::id(),
                    'type'            => 'purchase_receipt',
                    'quantity_before' => $qtyBefore,
                    'quantity_change' => $qtyToReceive,
                    'quantity_after'  => $qtyBefore + $qtyToReceive,
                    'reference_id'    => $goodsReceipt->id,
                    'reference_type'  => GoodsReceipt::class,
                    'remarks'         => "GR {$goodsReceipt->gr_number} received",
                ]);
            }

            // Update GR status
            $grStatus = $allFull ? 'fully_received' : 'partially_received';
            $goodsReceipt->update(['status' => $grStatus]);

            $goodsReceipt->logs()->create([
                'user_id'     => Auth::id(),
                'action'      => 'completed',
                'from_status' => $fromStatus,
                'to_status'   => $grStatus,
                'remarks'     => 'Goods receipt completed and inventory updated',
            ]);

            // Update PO status
            $poAllFull = $po->items->every(fn($i) => (float)$i->qty_received >= (float)$i->qty_ordered);
            $newPoStatus = $poAllFull ? 'fully_received' : 'partially_received';
            $po->update(['status' => $newPoStatus]);

            $po->logs()->create([
                'user_id'     => Auth::id(),
                'action'      => 'gr_completed',
                'from_status' => $po->status,
                'to_status'   => $newPoStatus,
                'remarks'     => "GR {$goodsReceipt->gr_number} completed",
            ]);
        });

        return redirect()->route('goods-receipts.show', $goodsReceipt->id)
            ->with('success', 'Goods receipt completed and inventory updated.');
    }

    public function cancel(GoodsReceipt $goodsReceipt)
    {
        if (!in_array($goodsReceipt->status, ['pending'])) {
            return back()->withErrors(['error' => 'Only pending goods receipts can be cancelled.']);
        }

        DB::transaction(function () use ($goodsReceipt) {
            $fromStatus = $goodsReceipt->status;
            $goodsReceipt->update(['status' => 'cancelled']);

            $goodsReceipt->logs()->create([
                'user_id'     => Auth::id(),
                'action'      => 'cancelled',
                'from_status' => $fromStatus,
                'to_status'   => 'cancelled',
                'remarks'     => 'Goods receipt cancelled',
            ]);

            // Recalculate PO status
            $this->recalculatePoStatus($goodsReceipt->purchaseOrder);
        });

        return redirect()->route('goods-receipts.show', $goodsReceipt->id)
            ->with('success', 'Goods receipt cancelled.');
    }

    public function revert(GoodsReceipt $goodsReceipt)
    {
        // Only pending → revert means nothing received yet, just go back to pending
        // For partially/fully received, revert is not allowed as inventory already updated
        if ($goodsReceipt->status !== 'cancelled') {
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

        // Check if any GR is still active (not cancelled)
        $hasActiveGr = $po->goodsReceipts()
            ->whereNotIn('status', ['cancelled'])
            ->exists();

        if (!$hasActiveGr) {
            // No active GRs at all — revert PO to posted
            $po->update(['status' => 'posted']);
            return;
        }

        // Recalculate qty_received per PO item from completed GRs only
        foreach ($po->items as $poItem) {
            $totalReceived = GoodsReceiptItem::whereHas('goodsReceipt', function ($q) use ($po) {
                    $q->where('purchase_order_id', $po->id)
                    ->whereIn('status', ['partially_received', 'fully_received', 'completed']);
                })
                ->where('purchase_order_item_id', $poItem->id)
                ->sum('qty_to_receive');

            $poItem->update(['qty_received' => $totalReceived]);
        }

        $po->refresh();

        $allFull = $po->items->every(
            fn($i) => (float) $i->qty_received >= (float) $i->qty_ordered
        );

        $anyReceived = $po->items->some(
            fn($i) => (float) $i->qty_received > 0
        );

        if ($allFull) {
            $po->update(['status' => 'fully_received']);
        } elseif ($anyReceived) {
            $po->update(['status' => 'partially_received']);
        } else {
            $po->update(['status' => 'posted']);
        }
    }
}
