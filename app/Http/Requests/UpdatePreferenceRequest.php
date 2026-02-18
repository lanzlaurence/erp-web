<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePreferenceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'app_name' => ['required', 'string', 'max:255'],
            'app_logo' => ['nullable', 'image', 'mimes:png,jpg,jpeg,svg', 'max:2048'],
            'decimal_places' => ['required', 'integer', 'min:0', 'max:6'],
            'color_theme' => ['required', 'string', 'in:blue,violet,green,rose,orange,zinc'],
            'timezone'       => ['required', 'string', 'timezone:all'],
        ];
    }
}
