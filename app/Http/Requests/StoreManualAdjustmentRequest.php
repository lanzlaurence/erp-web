<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreManualAdjustmentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $action = $this->input('action');

        return [
            'action'               => ['required', 'in:initial,adjust,transfer'],
            'transaction_date'     => ['required', 'date'],
            'location_id'          => ['required', 'exists:locations,id'],
            'transfer_location_id' => [
                Rule::requiredIf($action === 'transfer'),
                'nullable',
                'exists:locations,id',
                'different:location_id',
            ],
            'material_id' => [
                Rule::requiredIf($action === 'initial'),
                'nullable',
                'exists:materials,id',
                Rule::when($action === 'initial', [
                    Rule::unique('inventories')
                        ->where('location_id', $this->location_id)
                        ->whereNull('deleted_at'),
                ]),
            ],
            'inventory_id' => [
                Rule::requiredIf(in_array($action, ['adjust', 'transfer'])),
                'nullable',
                'exists:inventories,id',
            ],
            'quantity' => [
                'required',
                'numeric',
                'min:0.000001',
                function ($attribute, $value, $fail) use ($action) {
                    if ($action === 'adjust') {
                        $inventory = \App\Models\Inventory::find($this->inventory_id);
                        if ($inventory && (float) $value === (float) $inventory->quantity) {
                            $fail('No changes detected. Please enter a different quantity.');
                        }
                    }
                    if ($action === 'transfer') {
                        $inventory = \App\Models\Inventory::find($this->inventory_id);
                        if ($inventory && (float) $value > (float) $inventory->quantity) {
                            $fail('Transfer quantity cannot exceed available stock of ' . $inventory->quantity . '.');
                        }
                    }
                },
            ],
            'remarks' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'material_id.unique'          => 'This material already exists in the selected location.',
            'transfer_location_id.different' => 'Transfer location must be different from the source location.',
        ];
    }
}
