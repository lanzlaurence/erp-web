<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGoodsReceiptRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'purchase_order_id' => ['required', 'exists:purchase_orders,id'],
            'destination_id'    => ['required', 'exists:destinations,id'],
            'gr_date'           => ['required', 'date'],
            'transaction_date'  => ['required', 'date'],
            'remarks'           => ['nullable', 'string'],

            'items'                           => ['required', 'array', 'min:1'],
            'items.*.purchase_order_item_id'  => ['required', 'exists:purchase_order_items,id'],
            'items.*.qty_to_receive' => [
                'required',
                'numeric',
                'min:0',
                function ($attribute, $value, $fail) {
                    // Extract index from attribute name e.g. items.0.qty_to_receive
                    preg_match('/items\.(\d+)\./', $attribute, $matches);
                    $index = $matches[1] ?? null;

                    if ($index === null) return;

                    $items = request('items');
                    $poItemId = $items[$index]['purchase_order_item_id'] ?? null;

                    if (!$poItemId) return;

                    $poItem = \App\Models\PurchaseOrderItem::find($poItemId);
                    if (!$poItem) return;

                    $qtyRemaining = (float) $poItem->qty_ordered - (float) $poItem->qty_received;

                    if ((float) $value > $qtyRemaining) {
                        $fail("Qty to receive cannot exceed remaining qty of {$qtyRemaining}.");
                    }
                },
            ],
            'items.*.serial_number'           => ['nullable', 'string'],
            'items.*.batch_number'            => ['nullable', 'string'],
            'items.*.remarks'                 => ['nullable', 'string'],
        ];
    }
}
