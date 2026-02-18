<?php

namespace App\Http\Middleware;

use App\Models\Preference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user() ? $request->user()->load('roles.permissions') : null,
            ],
            'preferences' => [
                'app_name' => Preference::get('app_name', 'Example App'),
                'app_logo' => $this->getLogoUrl(),
                'decimal_places' => (int) Preference::get('decimal_places', '2'),
                'color_theme' => Preference::get('color_theme', 'zinc'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
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
