<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransferInventoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'location_id' => [
                'required',
                'exists:locations,id',
                'different:current_location_id',
            ],
            'quantity'       => [
                'required',
                'numeric',
                'min:0.01',
                'max:' . $this->inventory?->quantity,
            ],
            'remarks'        => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'location_id.different' => 'Transfer location must be different from current location.',
            'quantity.max'             => 'Transfer quantity cannot exceed available stock.',
        ];
    }
}
