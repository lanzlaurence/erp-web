<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\PurchaseOrderItem;
use App\Models\SalesOrderItem;
use App\Models\Material;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $materials = Material::with(['category', 'brand', 'uom'])
            ->withSum('inventories', 'quantity')
            ->get()
            ->map(function ($material) {
                $currentStock = (float) ($material->inventories_sum_quantity ?? 0);
                return [
                    'id'                => $material->id,
                    'code'              => $material->code,
                    'sku'               => $material->sku,
                    'name'              => $material->name,
                    'description'       => $material->description,
                    'category'          => $material->category?->name,
                    'brand'             => $material->brand?->name,
                    'uom'               => $material->uom?->acronym,
                    'unit_cost'         => (float) $material->unit_cost,
                    'avg_unit_cost'     => (float) $material->avg_unit_cost,
                    'unit_price'        => (float) $material->unit_price,
                    'avg_unit_price'    => (float) $material->avg_unit_price,
                    'current_stock'     => $currentStock,
                    'total_stock_value' => $currentStock * (float) $material->avg_unit_cost,
                    'total_sold_value'  => $this->getTotalSold($material->id, (float) $material->avg_unit_price),
                ];
            });

        return Inertia::render('dashboard', [
            'materials' => $materials,
        ]);
    }

    private function getTotalSold(int $materialId, float $avgUnitPrice): float
    {
        $totalQty = \App\Models\GoodsIssueItem::whereHas('goodsIssue', fn($q) => $q->where('status', 'completed'))
            ->where('material_id', $materialId)
            ->sum('qty_to_ship');

        return (float) $totalQty * $avgUnitPrice;
    }

    public function purchaseHistory(Material $material)
    {
        $material->load(['uom', 'category', 'brand']);

        $purchaseHistory = PurchaseOrderItem::with(['purchaseOrder.vendor'])
            ->where('material_id', $material->id)
            ->get()
            ->map(fn($item) => [
                'po_id'                    => $item->purchaseOrder->id,
                'po_code'                  => $item->purchaseOrder->code,
                'vendor_id'                => $item->purchaseOrder->vendor->id,
                'vendor_code'              => $item->purchaseOrder->vendor->code,
                'vendor_name'              => $item->purchaseOrder->vendor->name,
                'order_date'               => $item->purchaseOrder->order_date->format('Y-m-d'),
                'discount_amount'          => (float) $item->discount_amount,
                'unit_cost_after_discount' => (float) $item->unit_cost_after_discount,
                'qty_ordered'              => (float) $item->qty_ordered,
                'uom'                      => $material->uom?->acronym,
                'net_cost'                 => (float) $item->qty_ordered * (float) $item->unit_cost_after_discount,
            ]);

        $stockByLocation = Inventory::with('location')
            ->where('material_id', $material->id)
            ->get()
            ->map(fn($inv) => [
                'location_id'   => $inv->location->id,
                'location_name' => $inv->location->name,
                'quantity'      => (float) $inv->quantity,
            ]);

        return Inertia::render('dashboard/purchase-history', [
            'material'         => [
                'id'   => $material->id,
                'code' => $material->code,
                'name' => $material->name,
                'uom'  => $material->uom?->acronym,
            ],
            'purchaseHistory'  => $purchaseHistory,
            'stockByLocation'  => $stockByLocation,
        ]);
    }

    public function salesHistory(Material $material)
    {
        $material->load(['uom', 'category', 'brand']);

        $salesHistory = SalesOrderItem::with(['salesOrder.customer'])
            ->where('material_id', $material->id)
            ->get()
            ->map(fn($item) => [
                'so_id'                     => $item->salesOrder->id,
                'so_code'                   => $item->salesOrder->code,
                'customer_id'               => $item->salesOrder->customer->id,
                'customer_code'             => $item->salesOrder->customer->code,
                'customer_name'             => $item->salesOrder->customer->name,
                'order_date'                => $item->salesOrder->order_date->format('Y-m-d'),
                'discount_amount'           => (float) $item->discount_amount,
                'unit_price_after_discount' => (float) $item->unit_price_after_discount,
                'qty_ordered'               => (float) $item->qty_ordered,
                'uom'                       => $material->uom?->acronym,
                'net_price'                 => (float) $item->qty_ordered * (float) $item->unit_price_after_discount,
            ]);

        $stockByLocation = Inventory::with('location')
            ->where('material_id', $material->id)
            ->get()
            ->map(fn($inv) => [
                'location_id'   => $inv->location->id,
                'location_name' => $inv->location->name,
                'quantity'      => (float) $inv->quantity,
            ]);

        return Inertia::render('dashboard/sales-history', [
            'material'        => [
                'id'   => $material->id,
                'code' => $material->code,
                'name' => $material->name,
                'uom'  => $material->uom?->acronym,
            ],
            'salesHistory'    => $salesHistory,
            'stockByLocation' => $stockByLocation,
        ]);
    }
}
