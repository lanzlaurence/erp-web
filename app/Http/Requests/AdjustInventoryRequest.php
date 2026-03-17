<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdjustInventoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'quantity' => [
                'required',
                'numeric',
                'min:0',
                function ($attribute, $value, $fail) {
                    if ((float) $value === (float) $this->route('inventory')->quantity) {
                        $fail('No changes detected. Please enter a different quantity.');
                    }
                },
            ],
            'remarks' => ['nullable', 'string'],
        ];
    }
}
