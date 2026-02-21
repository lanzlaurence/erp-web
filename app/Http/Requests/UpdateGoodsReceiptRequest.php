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
            $index    = $matches[1] ?? null;
            if ($index === null) return;

            $poItemId = $this->input("items.{$index}.purchase_order_item_id");
            if (!$poItemId) return;

            $poItem = PurchaseOrderItem::find($poItemId);
            if (!$poItem) return;

            // When editing a pending GR, qty_received on the PO item
            // does NOT include this GR's current qty (it's still pending).
            // So qty_remaining is simply qty_ordered - qty_received.
            $qtyRemaining = (float) $poItem->qty_ordered - (float) $poItem->qty_received;

            if ((float) $value > $qtyRemaining) {
                $fail("Qty to receive cannot exceed remaining quantity of {$qtyRemaining}.");
            }
        };
    }
}
