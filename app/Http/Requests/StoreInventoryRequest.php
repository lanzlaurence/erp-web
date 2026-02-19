<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInventoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'material_id'    => [
                'required',
                'exists:materials,id',
                Rule::unique('inventories')
                    ->where('destination_id', $this->destination_id)
                    ->whereNull('deleted_at'),
            ],
            'destination_id' => ['required', 'exists:destinations,id'],
            'quantity'       => ['required', 'numeric', 'min:0'],
            'remarks'        => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'material_id.unique' => 'This material already exists in the selected destination.',
        ];
    }
}
