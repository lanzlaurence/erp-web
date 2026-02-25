<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\Vendor;
use App\Models\SalesOrder;
use App\Models\Customer;
use App\Models\Inventory;
use App\Models\Location;
use App\Models\Material;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\Middleware;

class AnalyticsController extends Controller
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:analytics-purchase-order-report', only: ['purchaseOrderReports']),
            new Middleware('permission:analytics-sales-order-report',    only: ['salesOrderReports']),
            new Middleware('permission:analytics-inventory-report',      only: ['inventoryReport']),
        ];
    }

    public function purchaseOrderReports(Request $request)
    {
        $query = PurchaseOrder::with([
            'vendor',
            'items.material.uom',
        ])
        ->when($request->vendor_id, fn($q) => $q->where('vendor_id', $request->vendor_id))
        ->when($request->status,    fn($q) => $q->where('status', $request->status))
        ->when($request->date_from, fn($q) => $q->whereDate('order_date', '>=', $request->date_from))
        ->when($request->date_to,   fn($q) => $q->whereDate('order_date', '<=', $request->date_to))
        ->whereNotIn('status', ['draft', 'cancelled'])
        ->latest('order_date');

        $purchaseOrders = $query->paginate(50)->withQueryString();

        return Inertia::render('analytics/purchase-order-reports', [
            'purchaseOrders' => $purchaseOrders,
            'vendors'        => Vendor::where('status', 'active')->get(['id', 'code', 'name']),
            'filters'        => $request->only(['vendor_id', 'status', 'date_from', 'date_to']),
        ]);
    }

    public function salesOrderReports(Request $request)
    {
        $query = SalesOrder::with([
            'customer',
            'items.material.uom',
        ])
        ->when($request->customer_id, fn($q) => $q->where('customer_id', $request->customer_id))
        ->when($request->status,      fn($q) => $q->where('status', $request->status))
        ->when($request->date_from,   fn($q) => $q->whereDate('order_date', '>=', $request->date_from))
        ->when($request->date_to,     fn($q) => $q->whereDate('order_date', '<=', $request->date_to))
        ->whereNotIn('status', ['draft', 'cancelled'])
        ->latest('order_date');

        $salesOrders = $query->paginate(50)->withQueryString();

        return Inertia::render('analytics/sales-order-reports', [
            'salesOrders' => $salesOrders,
            'customers'   => Customer::where('status', 'active')->get(['id', 'code', 'name']),
            'filters'     => $request->only(['customer_id', 'status', 'date_from', 'date_to']),
        ]);
    }

    public function inventoryReport(Request $request)
    {
        $query = Inventory::with(['material.brand', 'material.category', 'material.uom', 'location'])
            ->when($request->location_id,  fn($q) => $q->where('location_id', $request->location_id))
            ->when($request->category_id,  fn($q) => $q->whereHas('material', fn($m) => $m->where('category_id', $request->category_id)))
            ->when($request->material_search, fn($q) => $q->whereHas('material', fn($m) =>
                $m->where('name', 'like', '%' . $request->material_search . '%')
                ->orWhere('code', 'like', '%' . $request->material_search . '%')
            ))
            ->when($request->stock_filter === 'low',      fn($q) => $q->whereHas('material', fn($m) => $m->whereColumn('inventories.quantity', '<=', 'materials.reorder_level')->where('materials.reorder_level', '>', 0)))
            ->when($request->stock_filter === 'zero',     fn($q) => $q->where('quantity', '<=', 0))
            ->when($request->stock_filter === 'positive', fn($q) => $q->where('quantity', '>', 0))
            ->latest('id');

        $inventories = $query->paginate(50)->withQueryString();

        // Summary totals (across all pages / filtered set — re-query without paginate)
        $summaryQuery = Inventory::with('material')
            ->when($request->location_id,  fn($q) => $q->where('location_id', $request->location_id))
            ->when($request->category_id,  fn($q) => $q->whereHas('material', fn($m) => $m->where('category_id', $request->category_id)))
            ->when($request->material_search, fn($q) => $q->whereHas('material', fn($m) =>
                $m->where('name', 'like', '%' . $request->material_search . '%')
                ->orWhere('code', 'like', '%' . $request->material_search . '%')
            ))
            ->when($request->stock_filter === 'low',      fn($q) => $q->whereHas('material', fn($m) => $m->whereColumn('inventories.quantity', '<=', 'materials.reorder_level')->where('materials.reorder_level', '>', 0)))
            ->when($request->stock_filter === 'zero',     fn($q) => $q->where('quantity', '<=', 0))
            ->when($request->stock_filter === 'positive', fn($q) => $q->where('quantity', '>', 0))
            ->get(['quantity', 'material_id']);

        $totalCostValue  = $summaryQuery->sum(fn($i) => (float) $i->quantity * (float) ($i->material?->avg_unit_cost ?? 0));
        $totalPriceValue = $summaryQuery->sum(fn($i) => (float) $i->quantity * (float) ($i->material?->avg_unit_price ?? 0));
        $totalSkus       = $summaryQuery->count();
        $zeroStockCount  = $summaryQuery->filter(fn($i) => (float) $i->quantity <= 0)->count();

        return Inertia::render('analytics/inventory-report', [
            'inventories'     => $inventories,
            'locations'       => \App\Models\Location::orderBy('name')->get(['id', 'name']),
            'categories'      => \App\Models\Category::orderBy('name')->get(['id', 'name']),
            'filters'         => $request->only(['location_id', 'category_id', 'material_search', 'stock_filter']),
            'summary' => [
                'total_skus'        => $totalSkus,
                'zero_stock_count'  => $zeroStockCount,
                'total_cost_value'  => round($totalCostValue, 2),
                'total_price_value' => round($totalPriceValue, 2),
            ],
        ]);
    }
}
