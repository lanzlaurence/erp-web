<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'vendor_id'       => ['required', 'exists:vendors,id'],
            'order_date'      => ['required', 'date'],
            'delivery_date'   => ['nullable', 'date', 'after_or_equal:order_date'],
            'reference_no'    => ['nullable', 'string', 'max:255'],
            'discount_type'   => ['nullable', 'in:fixed,percentage'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'remarks'         => ['nullable', 'string'],

            'items'                   => ['required', 'array', 'min:1'],
            'items.*.material_id'     => ['required', 'exists:materials,id'],
            'items.*.qty_ordered'     => ['required', 'numeric', 'min:0.000001'],
            'items.*.unit_cost'      => ['required', 'numeric', 'min:0'],
            'items.*.discount_type'   => ['nullable', 'in:fixed,percentage'],
            'items.*.discount_amount' => ['nullable', 'numeric', 'min:0'],
            'items.*.is_vatable'      => ['boolean'],
            'items.*.vat_type'        => ['nullable', 'in:exclusive,inclusive'],
            'items.*.vat_rate'        => ['nullable', 'numeric', 'min:0'],
            'items.*.remarks'         => ['nullable', 'string'],

            'charges'             => ['nullable', 'array'],
            'charges.*.charge_id' => ['required', 'exists:charges,id'],
        ];
    }
}
