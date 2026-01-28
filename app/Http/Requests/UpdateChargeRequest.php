<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateChargeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', Rule::in(['tax', 'discount'])],
            'value_type' => ['required', Rule::in(['percentage', 'fixed'])],
            'value' => ['required', 'numeric', 'min:0', 'max:999999999.99'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The charge name is required.',
            'type.required' => 'Please select a charge type (Tax or Discount).',
            'type.in' => 'The charge type must be either Tax or Discount.',
            'value_type.required' => 'Please select a value type (Percentage or Fixed).',
            'value_type.in' => 'The value type must be either Percentage or Fixed.',
            'value.required' => 'The charge value is required.',
            'value.numeric' => 'The charge value must be a number.',
            'value.min' => 'The charge value must be at least 0.',
        ];
    }
}
