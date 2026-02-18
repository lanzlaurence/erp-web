<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdatePreferenceRequest;
use App\Models\Preference;
use App\Traits\HandlesFileUpload;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PreferenceController extends Controller implements HasMiddleware
{
    use HandlesFileUpload;

    public static function middleware(): array
    {
        return [
            new Middleware('permission:preference-view', only: ['index']),
            new Middleware('permission:preference-edit', only: ['update']),
        ];
    }

    public function index()
    {
        $formData = [
            'app_name' => Preference::get('app_name', 'Example App'),
            'app_logo_url' => $this->getLogoUrl(),
            'decimal_places' => Preference::get('decimal_places', '2'),
            'color_theme' => Preference::get('color_theme', 'blue'),
            'timezone' => Preference::get('timezone', 'Asia/Manila'),
            'currency' => Preference::get('currency', 'PHP'),
            'date_format' => Preference::get('date_format', 'MM/DD/YYYY'),
            'time_format' => Preference::get('time_format', '12h'),
        ];

        return Inertia::render('preference/index', ['formData' => $formData]);
    }

    public function update(UpdatePreferenceRequest $request)
    {
        Preference::set('app_name', $request->app_name);
        Preference::set('decimal_places', $request->decimal_places, 'number');
        Preference::set('color_theme', $request->color_theme);
        Preference::set('timezone', $request->timezone);
        Preference::set('currency', $request->currency);

        if ($request->hasFile('app_logo')) {
            $oldLogo = Preference::get('app_logo');

            if ($oldLogo && $oldLogo !== 'favicon.png') {
                $this->deleteFile($oldLogo, 'public');
            }

            $logoPath = $this->uploadFile(
                $request->file('app_logo'),
                'logos',
                'public'
            );

            Preference::set('app_logo', $logoPath, 'image');
        }

        return redirect()->route('preferences.index')
            ->with('success', 'Preferences updated successfully');
    }

    private function getLogoUrl(): string
    {
        $logo = Preference::get('app_logo', 'favicon.png');

        if ($logo === 'favicon.png') {
            return asset('favicon.png');
        }

        return Storage::disk('public')->url($logo);
    }
}
