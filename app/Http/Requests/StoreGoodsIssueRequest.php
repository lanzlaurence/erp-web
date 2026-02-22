<?php

namespace App\Http\Requests;

use App\Models\SalesOrderItem;
use Illuminate\Foundation\Http\FormRequest;

class StoreGoodsIssueRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'sales_order_id'                  => ['required', 'exists:sales_orders,id'],
            'location_id'                     => ['required', 'exists:locations,id'],
            'gi_date'                         => ['required', 'date'],
            'transaction_date'                => ['required', 'date'],
            'remarks'                         => ['nullable', 'string'],
            'items'                           => ['required', 'array', 'min:1'],
            'items.*.sales_order_item_id'     => ['required', 'exists:sales_order_items,id'],
            'items.*.qty_to_issue'            => ['required', 'numeric', 'min:0.000001', $this->qtyRule()],
            'items.*.serial_number'           => ['nullable', 'string'],
            'items.*.batch_number'            => ['nullable', 'string'],
            'items.*.remarks'                 => ['nullable', 'string'],
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

            $qtyRemaining = (float) $soItem->qty_ordered - (float) $soItem->qty_issued;

            if ((float) $value > $qtyRemaining) {
                $fail("Qty to issue cannot exceed remaining quantity of {$qtyRemaining}.");
            }
        };
    }
}
