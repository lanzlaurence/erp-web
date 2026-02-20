<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function purchaseOrders(Request $request)
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

        return Inertia::render('reports/purchase-orders', [
            'purchaseOrders' => $purchaseOrders,
            'vendors'        => Vendor::where('status', 'active')->get(['id', 'code', 'name']),
            'filters'        => $request->only(['vendor_id', 'status', 'date_from', 'date_to']),
        ]);
    }
}
