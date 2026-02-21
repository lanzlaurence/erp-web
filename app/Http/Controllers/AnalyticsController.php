<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Routing\Controllers\Middleware;

class AnalyticsController extends Controller
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:analytics-purchase-order-report', only: ['purchaseOrderReports']),
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
}
