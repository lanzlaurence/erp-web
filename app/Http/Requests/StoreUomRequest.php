<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUomRequest extends FormRequest
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
                Rule::unique('uoms')->whereNull('deleted_at'),
            ],
            'description' => ['nullable', 'string'],
        ];
    }
}
