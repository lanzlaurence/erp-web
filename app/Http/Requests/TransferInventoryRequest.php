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
            'destination_id' => [
                'required',
                'exists:destinations,id',
                'different:current_destination_id',
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
            'destination_id.different' => 'Transfer destination must be different from current destination.',
            'quantity.max'             => 'Transfer quantity cannot exceed available stock.',
        ];
    }
}
