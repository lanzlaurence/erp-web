<?php

namespace App\Http\Requests;

use App\Models\PurchaseOrderItem;
use Illuminate\Foundation\Http\FormRequest;

class UpdateGoodsReceiptRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'location_id'                 => ['required', 'exists:locations,id'],
            'gr_date'                        => ['required', 'date'],
            'transaction_date'               => ['required', 'date'],
            'remarks'                        => ['nullable', 'string'],
            'items'                          => ['required', 'array', 'min:1'],
            'items.*.purchase_order_item_id' => ['required', 'exists:purchase_order_items,id'],
            'items.*.qty_to_receive'         => ['required', 'numeric', 'min:0.000001', $this->qtyRule()],
            'items.*.serial_number'          => ['nullable', 'string'],
            'items.*.batch_number'           => ['nullable', 'string'],
            'items.*.remarks'                => ['nullable', 'string'],
        ];
    }

    private function qtyRule(): \Closure
    {
        return function ($attribute, $value, $fail) {
            preg_match('/items\.(\d+)\./', $attribute, $matches);
            $index = $matches[1] ?? null;
            if ($index === null) return;

            $poItemId = $this->input("items.{$index}.purchase_order_item_id");
            if (!$poItemId) return;

            $poItem = PurchaseOrderItem::find($poItemId);
            if (!$poItem) return;

            $grId = $this->route('goods_receipt')?->id ?? $this->route('goods_receipt');

            // Sum qty_to_receive from OTHER pending GRs for this PO item
            $otherPendingQty = \App\Models\GoodsReceiptItem::query()
                ->where('purchase_order_item_id', $poItemId)
                ->whereHas('goodsReceipt', fn($q) => $q
                    ->where('status', 'pending')
                    ->when($grId, fn($q) => $q->where('id', '!=', $grId))
                )
                ->sum('qty_to_receive');

            $qtyRemaining = (float) $poItem->qty_ordered
                - (float) $poItem->qty_received
                - (float) $otherPendingQty;

            if ((float) $value > $qtyRemaining) {
                $fail("Qty to receive cannot exceed remaining quantity of {$qtyRemaining}.");
            }
        };
    }
}
