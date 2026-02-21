<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInventoryRequest;
use App\Http\Requests\TransferInventoryRequest;
use App\Http\Requests\AdjustInventoryRequest;
use App\Models\Location;
use App\Models\Inventory;
use App\Models\InventoryLog;
use App\Models\Material;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InventoryController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:inventory-view',     only: ['index', 'show']),
            new Middleware('permission:inventory-create',   only: ['create', 'store']),
            new Middleware('permission:inventory-adjust',   only: ['adjust', 'processAdjust']),
            new Middleware('permission:inventory-transfer', only: ['transfer', 'processTransfer']),
            new Middleware('permission:inventory-delete',   only: ['destroy']),
        ];
    }

    public function index()
    {
        $inventories = Inventory::with(['material', 'location'])
            ->latest()
            ->paginate(10);

        return Inertia::render('inventory/index', [
            'inventories' => $inventories,
        ]);
    }

    public function create()
    {
        return Inertia::render('inventory/create', [
            'materials'    => Material::where('status', 'active')->get(['id', 'code', 'name']),
            'locations' => Location::all(['id', 'code', 'name']),
        ]);
    }

    public function store(StoreInventoryRequest $request)
    {
        DB::transaction(function () use ($request) {
            $inventory = Inventory::create([
                'code'           => Inventory::generateCode(),
                'material_id'    => $request->material_id,
                'location_id' => $request->location_id,
                'quantity'       => $request->quantity,
            ]);

            InventoryLog::create([
                'movement_code'  => InventoryLog::generateMovementCode(),
                'inventory_id'   => $inventory->id,
                'material_id'    => $inventory->material_id,
                'location_id' => $inventory->location_id,
                'user_id'        => Auth::id(),
                'type'           => 'initial',
                'quantity_before' => 0,
                'quantity_change' => $request->quantity,
                'quantity_after'  => $request->quantity,
                'remarks'        => $request->remarks,
            ]);
        });

        return redirect()->route('inventories.index')
            ->with('success', 'Inventory created successfully');
    }

    public function show(Inventory $inventory)
    {
        $inventory->load(['material', 'location']);

        $logs = InventoryLog::with(['user', 'location', 'transferToLocation'])
            ->where('inventory_id', $inventory->id)
            ->latest()
            ->paginate(10);

        return Inertia::render('inventory/show', [
            'inventory' => $inventory,
            'logs'      => $logs,
        ]);
    }

    public function adjust(Inventory $inventory)
    {
        return Inertia::render('inventory/adjust', [
            'inventory' => $inventory->load(['material', 'location']),
        ]);
    }

    public function processAdjust(AdjustInventoryRequest $request, Inventory $inventory)
    {
        DB::transaction(function () use ($request, $inventory) {
            $quantityBefore = $inventory->quantity;
            $quantityChange = $request->quantity - $quantityBefore;

            $inventory->update(['quantity' => $request->quantity]);

            InventoryLog::create([
                'movement_code'   => InventoryLog::generateMovementCode(),
                'inventory_id'    => $inventory->id,
                'material_id'     => $inventory->material_id,
                'location_id'  => $inventory->location_id,
                'user_id'         => Auth::id(),
                'type'            => 'adjustment',
                'quantity_before' => $quantityBefore,
                'quantity_change' => $quantityChange,
                'quantity_after'  => $request->quantity,
                'remarks'         => $request->remarks,
            ]);
        });

        return redirect()->route('inventories.index')
            ->with('success', 'Inventory adjusted successfully');
    }

    public function transfer(Inventory $inventory)
    {
        return Inertia::render('inventory/transfer', [
            'inventory'    => $inventory->load(['material', 'location']),
            'locations' => Location::where('id', '!=', $inventory->location_id)
                ->get(['id', 'code', 'name']),
        ]);
    }

    public function processTransfer(TransferInventoryRequest $request, Inventory $inventory)
    {
        DB::transaction(function () use ($request, $inventory) {
            $quantityBefore  = $inventory->quantity;
            $transferQty     = $request->quantity;
            $quantityAfter   = $quantityBefore - $transferQty;

            // Deduct from source
            $inventory->update(['quantity' => $quantityAfter]);

            // Log transfer out
            InventoryLog::create([
                'movement_code'             => InventoryLog::generateMovementCode(),
                'inventory_id'              => $inventory->id,
                'material_id'               => $inventory->material_id,
                'location_id'            => $inventory->location_id,
                'user_id'                   => Auth::id(),
                'type'                      => 'transfer_out',
                'quantity_before'           => $quantityBefore,
                'quantity_change'           => -$transferQty,
                'quantity_after'            => $quantityAfter,
                'transfer_to_location_id' => $request->location_id,
                'remarks'                   => $request->remarks,
            ]);

            // Find or create location inventory
            $targetInventory = Inventory::withTrashed()
                ->where('material_id', $inventory->material_id)
                ->where('location_id', $request->location_id)
                ->first();

            if ($targetInventory) {
                if ($targetInventory->trashed()) {
                    $targetInventory->restore();
                }
                $targetBefore = $targetInventory->quantity;
                $targetInventory->update(['quantity' => $targetBefore + $transferQty]);
            } else {
                $targetBefore    = 0;
                $targetInventory = Inventory::create([
                    'material_id'    => $inventory->material_id,
                    'location_id' => $request->location_id,
                    'quantity'       => $transferQty,
                ]);
            }

            // Log transfer in
            InventoryLog::create([
            'movement_code'                 => InventoryLog::generateMovementCode(),
                'inventory_id'              => $targetInventory->id,
                'material_id'               => $inventory->material_id,
                'location_id'            => $request->location_id,
                'user_id'                   => Auth::id(),
                'type'                      => 'transfer_in',
                'quantity_before'           => $targetBefore,
                'quantity_change'           => $transferQty,
                'quantity_after'            => $targetBefore + $transferQty,
                'transfer_to_location_id' => $inventory->location_id,
                'remarks'                   => $request->remarks,
            ]);
        });

        return redirect()->route('inventories.index')
            ->with('success', 'Inventory transferred successfully');
    }

    public function destroy(Inventory $inventory)
    {
        if ($inventory->quantity > 0) {
            return redirect()->route('inventories.index')
                ->withErrors(['error' => 'Cannot delete inventory with remaining stock.']);
        }

        $inventory->delete();

        return redirect()->route('inventories.index')
            ->with('success', 'Inventory deleted successfully');
    }
}
