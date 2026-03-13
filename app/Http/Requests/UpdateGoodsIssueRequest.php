<?php

namespace App\Http\Requests;

use App\Models\SalesOrderItem;
use Illuminate\Foundation\Http\FormRequest;

class UpdateGoodsIssueRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'location_id'                 => ['required', 'exists:locations,id'],
            'gi_date'                     => ['required', 'date'],
            'transaction_date'            => ['required', 'date'],
            'remarks'                     => ['nullable', 'string'],
            'items'                       => ['required', 'array', 'min:1'],
            'items.*.sales_order_item_id' => ['required', 'exists:sales_order_items,id'],
            'items.*.qty_to_ship' => ['required', 'numeric', 'min:0.000001', $this->qtyRule(), $this->inventoryRule()],
            'items.*.serial_number'       => ['nullable', 'string'],
            'items.*.batch_number'        => ['nullable', 'string'],
            'items.*.remarks'             => ['nullable', 'string'],
        ];
    }

    private function qtyRule(): \Closure
    {
        return function ($attribute, $value, $fail) {
            preg_match('/items\.(\d+)\./', $attribute, $matches);
            $index = $matches[1] ?? null;
            if ($index === null) return;

            $soItemId = $this->input("items.{$index}.sales_order_item_id");
            if (!$soItemId) return;

            $soItem = SalesOrderItem::find($soItemId);
            if (!$soItem) return;

            $giId = $this->route('goods_issue')?->id ?? $this->route('goods_issue');

            $otherPendingQty = \App\Models\GoodsIssueItem::query()
                ->where('sales_order_item_id', $soItemId)
                ->whereHas('goodsIssue', fn($q) => $q
                    ->where('status', 'pending')
                    ->when($giId, fn($q) => $q->where('id', '!=', $giId))
                )
                ->sum('qty_to_ship');

            $qtyRemaining = (float) $soItem->qty_ordered
                - (float) $soItem->qty_shipped
                - (float) $otherPendingQty;

            if ((float) $value > $qtyRemaining) {
                $fail("Qty to ship cannot exceed remaining quantity of {$qtyRemaining}.");
            }
        };
    }

    private function inventoryRule(): \Closure
    {
        return function ($attribute, $value, $fail) {
            $locationId = $this->input('location_id');
            if (!$locationId) return;

            preg_match('/items\.(\d+)\./', $attribute, $matches);
            $index = $matches[1] ?? null;
            if ($index === null) return;

            $soItemId = $this->input("items.{$index}.sales_order_item_id");
            if (!$soItemId) return;

            $soItem = \App\Models\SalesOrderItem::find($soItemId);
            if (!$soItem) return;

            $inventory = \App\Models\Inventory::where('material_id', $soItem->material_id)
                ->where('location_id', $locationId)
                ->first();

            $physicalQty = $inventory ? (float) $inventory->quantity : 0;

            // Subtract already-pending GI quantities for this material+location
            $giId = $this->route('goods_issue')?->id; // null on store, current GI id on update

            $reservedQty = \App\Models\GoodsIssueItem::query()
                ->where('material_id', $soItem->material_id)
                ->whereHas('goodsIssue', fn($q) => $q
                    ->where('status', 'pending')
                    ->where('location_id', $locationId)
                    ->when($giId, fn($q) => $q->where('id', '!=', $giId))
                )
                ->sum('qty_to_ship');

            $available = $physicalQty - (float) $reservedQty;

            if ((float) $value > $available) {
                $material = $soItem->material;
                $fail("Insufficient stock for [{$material->code}] {$material->name}. Available: {$available}, Required: {$value}.");
            }
        };
    }
}
