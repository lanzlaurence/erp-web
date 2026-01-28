<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'acronym' => [
                'required',
                'string',
                'max:255',
                Rule::unique('uoms')->ignore($this->uom)->whereNull('deleted_at'),
            ],
            'description' => ['nullable', 'string'],
        ];
    }
}
