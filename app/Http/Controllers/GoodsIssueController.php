<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGoodsIssueRequest;
use App\Http\Requests\UpdateGoodsIssueRequest;
use App\Models\GoodsIssue;
use App\Models\GoodsIssueItem;
use App\Models\Inventory;
use App\Models\InventoryLog;
use App\Models\Location;
use App\Models\Material;
use App\Models\SalesOrder;
use App\Models\SalesOrderItem;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GoodsIssueController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:goods-issue-view',     only: ['index', 'show']),
            new Middleware('permission:goods-issue-create',   only: ['create', 'store']),
            new Middleware('permission:goods-issue-edit',     only: ['edit', 'update']),
            new Middleware('permission:goods-issue-delete',   only: ['destroy']),
            new Middleware('permission:goods-issue-complete', only: ['complete']),
            new Middleware('permission:goods-issue-cancel',   only: ['cancel']),
            new Middleware('permission:goods-issue-revert',   only: ['revert']),
        ];
    }

    public function index()
    {
        $gis = GoodsIssue::with(['salesOrder.customer', 'location', 'user'])
            ->latest()
            ->paginate(10);

        return Inertia::render('sales/goods-issue/index', [
            'goodsIssues' => $gis,
        ]);
    }

    public function create(SalesOrder $salesOrder)
    {
        if (!$salesOrder->canCreateGi()) {
            return redirect()->route('sales-orders.show', $salesOrder->id)
                ->withErrors(['error' => 'Goods issue cannot be created for this sales order.']);
        }

        $salesOrder->load([
            'customer',
            'items.material.brand',
            'items.material.category',
            'items.material.uom',
        ]);

        return Inertia::render('sales/goods-issue/create', [
            'salesOrder' => $salesOrder,
            'locations'  => Location::all(['id', 'code', 'name']),
        ]);
    }

    public function store(StoreGoodsIssueRequest $request)
    {
        DB::transaction(function () use ($request) {
            $so = SalesOrder::findOrFail($request->sales_order_id);

            $gi = GoodsIssue::create([
                'sales_order_id'   => $so->id,
                'user_id'          => Auth::id(),
                'location_id'      => $request->location_id,
                'status'           => 'pending',
                'gi_date'          => $request->gi_date,
                'transaction_date' => $request->transaction_date,
                'remarks'          => $request->remarks,
            ]);

            foreach ($request->items as $item) {
                $soItem     = SalesOrderItem::findOrFail($item['sales_order_item_id']);
                $qtyIssued  = (float) $soItem->qty_issued;
                $qtyOrdered = (float) $soItem->qty_ordered;

                $gi->items()->create([
                    'sales_order_item_id' => $soItem->id,
                    'material_id'         => $soItem->material_id,
                    'qty_ordered'         => $qtyOrdered,
                    'qty_issued'          => $qtyIssued,
                    'qty_to_issue'        => (float) $item['qty_to_issue'],
                    'qty_remaining'       => $qtyOrdered - $qtyIssued - (float) $item['qty_to_issue'],
                    'unit_price'          => $soItem->unit_price_after_discount,
                    'serial_number'       => $item['serial_number'] ?? null,
                    'batch_number'        => $item['batch_number'] ?? null,
                    'remarks'             => $item['remarks'] ?? null,
                ]);
            }

            $gi->logs()->create([
                'user_id'   => Auth::id(),
                'action'    => 'created',
                'to_status' => 'pending',
                'remarks'   => 'Goods issue created',
            ]);

            $so->logs()->create([
                'user_id' => Auth::id(),
                'action'  => 'gi_created',
                'remarks' => "GI {$gi->code} created",
            ]);
        });

        return redirect()->route('goods-issues.index')
            ->with('success', 'Goods issue created successfully.');
    }

    public function show(GoodsIssue $goodsIssue)
    {
        $goodsIssue->load([
            'salesOrder.customer',
            'location',
            'user',
            'items.material',
            'items.salesOrderItem',
            'logs.user',
        ]);

        return Inertia::render('sales/goods-issue/show', [
            'goodsIssue' => $goodsIssue,
        ]);
    }

    public function edit(GoodsIssue $goodsIssue)
    {
        if ($goodsIssue->status !== 'pending') {
            return redirect()->route('goods-issues.show', $goodsIssue->id)
                ->withErrors(['error' => 'Only pending goods issues can be edited.']);
        }

        $goodsIssue->load([
            'salesOrder.customer',
            'salesOrder.items.material',
            'location',
            'items.material',
            'items.salesOrderItem',
        ]);

        return Inertia::render('sales/goods-issue/edit', [
            'goodsIssue' => $goodsIssue,
            'locations'  => Location::all(['id', 'code', 'name']),
        ]);
    }

    public function update(UpdateGoodsIssueRequest $request, GoodsIssue $goodsIssue)
    {
        if ($goodsIssue->status !== 'pending') {
            return redirect()->route('goods-issues.show', $goodsIssue->id)
                ->withErrors(['error' => 'Only pending goods issues can be edited.']);
        }

        DB::transaction(function () use ($request, $goodsIssue) {
            $goodsIssue->update([
                'location_id'      => $request->location_id,
                'gi_date'          => $request->gi_date,
                'transaction_date' => $request->transaction_date,
                'remarks'          => $request->remarks,
            ]);

            foreach ($request->items as $item) {
                $goodsIssue->items()
                    ->where('sales_order_item_id', $item['sales_order_item_id'])
                    ->update([
                        'qty_to_issue'  => $item['qty_to_issue'],
                        'serial_number' => $item['serial_number'] ?? null,
                        'batch_number'  => $item['batch_number'] ?? null,
                        'remarks'       => $item['remarks'] ?? null,
                    ]);
            }

            $goodsIssue->logs()->create([
                'user_id'     => Auth::id(),
                'action'      => 'updated',
                'from_status' => $goodsIssue->status,
                'to_status'   => $goodsIssue->status,
                'remarks'     => 'Goods issue updated',
            ]);
        });

        return redirect()->route('goods-issues.show', $goodsIssue->id)
            ->with('success', 'Goods issue updated successfully.');
    }

    public function destroy(GoodsIssue $goodsIssue)
    {
        if ($goodsIssue->status !== 'pending') {
            return redirect()->route('goods-issues.show', $goodsIssue->id)
                ->withErrors(['error' => 'Only pending goods issues can be deleted.']);
        }

        DB::transaction(function () use ($goodsIssue) {
            $so = $goodsIssue->salesOrder;
            $goodsIssue->delete();
            $this->recalculateSoStatus($so);
        });

        return redirect()->route('goods-issues.index')
            ->with('success', 'Goods issue deleted successfully.');
    }

    // ── Status Actions ────────────────────────────────────────────────────────

    public function complete(GoodsIssue $goodsIssue)
    {
        if (!$goodsIssue->canBeCompleted()) {
            return back()->withErrors(['error' => 'Only pending goods issues can be completed.']);
        }

        DB::transaction(function () use ($goodsIssue) {
            $so                  = $goodsIssue->salesOrder;
            $affectedMaterialIds = [];

            foreach ($goodsIssue->items as $giItem) {
                $qtyToIssue = (float) $giItem->qty_to_issue;
                if ($qtyToIssue <= 0) continue;

                // Update SO item qty_issued
                $soItem        = $giItem->salesOrderItem;
                $newQtyIssued  = (float) $soItem->qty_issued + $qtyToIssue;
                $soItem->update(['qty_issued' => $newQtyIssued]);

                // Deduct inventory
                $inventory = Inventory::where('material_id', $giItem->material_id)
                    ->where('location_id', $goodsIssue->location_id)
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
                        'location_id' => $goodsIssue->location_id,
                        'quantity'    => 0,
                    ]);
                }

                InventoryLog::create([
                    'movement_code'   => InventoryLog::generateMovementCode(),
                    'inventory_id'    => $inventory->id,
                    'material_id'     => $giItem->material_id,
                    'location_id'     => $goodsIssue->location_id,
                    'user_id'         => Auth::id(),
                    'type'            => 'sales_issue',
                    'quantity_before' => $qtyBefore,
                    'quantity_change' => -$qtyToIssue,
                    'quantity_after'  => $newQty,
                    'reference_id'    => $goodsIssue->id,
                    'reference_type'  => GoodsIssue::class,
                    'remarks'         => "GI {$goodsIssue->code} completed",
                ]);

                $affectedMaterialIds[] = $giItem->material_id;
            }

            $goodsIssue->update(['status' => 'completed']);
            $goodsIssue->logs()->create([
                'user_id'     => Auth::id(),
                'action'      => 'completed',
                'from_status' => 'pending',
                'to_status'   => 'completed',
                'remarks'     => 'Goods issue completed and inventory deducted',
            ]);

            // Recalculate avg_unit_price
            foreach (array_unique($affectedMaterialIds) as $materialId) {
                $material = Material::find($materialId);
                $material?->recalculateAvgUnitPrice();
            }

            $this->recalculateSoStatus($so);
        });

        return redirect()->route('goods-issues.show', $goodsIssue->id)
            ->with('success', 'Goods issue completed and inventory deducted.');
    }

    public function cancel(GoodsIssue $goodsIssue)
    {
        if (!$goodsIssue->canBeCancelled()) {
            return back()->withErrors(['error' => 'This goods issue cannot be cancelled.']);
        }

        DB::transaction(function () use ($goodsIssue) {
            $fromStatus          = $goodsIssue->status;
            $so                  = $goodsIssue->salesOrder;
            $affectedMaterialIds = $goodsIssue->items
                ->where('qty_to_issue', '>', 0)
                ->pluck('material_id')
                ->unique()
                ->toArray();

            if ($fromStatus === 'completed') {
                foreach ($goodsIssue->items as $giItem) {
                    $qtyToRestore = (float) $giItem->qty_to_issue;
                    if ($qtyToRestore <= 0) continue;

                    $inventory = Inventory::where('material_id', $giItem->material_id)
                        ->where('location_id', $goodsIssue->location_id)
                        ->first();

                    if ($inventory) {
                        $qtyBefore = (float) $inventory->quantity;
                        $newQty    = $qtyBefore + $qtyToRestore;
                        $inventory->update(['quantity' => $newQty]);

                        InventoryLog::create([
                            'movement_code'   => InventoryLog::generateMovementCode(),
                            'inventory_id'    => $inventory->id,
                            'material_id'     => $giItem->material_id,
                            'location_id'     => $goodsIssue->location_id,
                            'user_id'         => Auth::id(),
                            'type'            => 'sales_return',
                            'quantity_before' => $qtyBefore,
                            'quantity_change' => $qtyToRestore,
                            'quantity_after'  => $newQty,
                            'reference_id'    => $goodsIssue->id,
                            'reference_type'  => GoodsIssue::class,
                            'remarks'         => "GI {$goodsIssue->code} cancelled - inventory restored",
                        ]);
                    }
                }
            }

            $goodsIssue->update(['status' => 'cancelled']);
            $goodsIssue->logs()->create([
                'user_id'     => Auth::id(),
                'action'      => 'cancelled',
                'from_status' => $fromStatus,
                'to_status'   => 'cancelled',
                'remarks'     => $fromStatus === 'completed'
                    ? 'Goods issue cancelled and inventory restored'
                    : 'Goods issue cancelled',
            ]);

            if ($fromStatus === 'completed') {
                foreach ($affectedMaterialIds as $materialId) {
                    $material = Material::find($materialId);
                    $material?->recalculateAvgUnitPrice();
                }
            }

            $this->recalculateSoStatus($so);
        });

        return redirect()->route('goods-issues.show', $goodsIssue->id)
            ->with('success', 'Goods issue cancelled.');
    }

    public function revert(GoodsIssue $goodsIssue)
    {
        if (!$goodsIssue->canBeReverted()) {
            return back()->withErrors(['error' => 'Only cancelled goods issues can be reverted to pending.']);
        }

        DB::transaction(function () use ($goodsIssue) {
            $goodsIssue->update(['status' => 'pending']);
            $goodsIssue->logs()->create([
                'user_id'     => Auth::id(),
                'action'      => 'reverted',
                'from_status' => 'cancelled',
                'to_status'   => 'pending',
                'remarks'     => 'Goods issue reverted to pending',
            ]);
        });

        return redirect()->route('goods-issues.show', $goodsIssue->id)
            ->with('success', 'Goods issue reverted to pending.');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function recalculateSoStatus(SalesOrder $so): void
    {
        $so->refresh();

        foreach ($so->items as $soItem) {
            $totalIssued = GoodsIssueItem::whereHas('goodsIssue', function ($q) use ($so) {
                    $q->where('sales_order_id', $so->id)
                    ->where('status', 'completed');
                })
                ->where('sales_order_item_id', $soItem->id)
                ->sum('qty_to_issue');

            $soItem->update(['qty_issued' => $totalIssued]);
        }

        $so->refresh();

        $allFull   = $so->items->every(fn($i) => (float)$i->qty_issued >= (float)$i->qty_ordered);
        $anyIssued = $so->items->some(fn($i)  => (float)$i->qty_issued > 0);

        if ($so->status === 'cancelled') return;

        if ($allFull) {
            $so->update(['status' => 'fully_issued']);
        } elseif ($anyIssued) {
            $so->update(['status' => 'partially_issued']);
        } else {
            $so->update(['status' => 'posted']);
        }

        $so->logs()->create([
            'user_id' => Auth::id(),
            'action'  => 'status_recalculated',
            'remarks' => "SO status recalculated to {$so->fresh()->status}",
        ]);
    }
}
