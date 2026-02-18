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
            'app_logo' => ['nullable', 'image', 'mimes:png,jpg,jpeg,svg', 'max:5120'],
            'decimal_places' => ['required', 'integer', 'min:0', 'max:6'],
            'color_theme' => ['required', 'string', 'in:blue,violet,green,rose,orange,zinc'],
            'timezone'       => ['required', 'string', 'timezone:all'],
            'currency' => ['required', 'string', 'max:10'],
            'date_format' => ['required', 'string', 'in:MM/DD/YYYY,DD/MM/YYYY,YYYY-MM-DD,MMM DD\, YYYY,MMMM DD\, YYYY,DD MMM YYYY'],
            'time_format' => ['required', 'string', 'in:12h,24h'],
        ];
    }
}
