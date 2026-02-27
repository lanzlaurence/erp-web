<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'max:255'],
            'state_province' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'suburb_barangay' => ['nullable', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:255'],
            'address_line_1' => ['nullable', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'payment_terms' => ['nullable', 'string', 'max:255'],
            'contact_persons' => ['nullable', 'array'],
            'contact_persons.*.name' => ['required', 'string', 'max:255'],
            'contact_persons.*.email' => ['required', 'email', 'max:255'],
            'contact_persons.*.phone' => ['required', 'string', 'max:255'],
            'credit_amount' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'in:active,inactive'],
        ];
    }
}
