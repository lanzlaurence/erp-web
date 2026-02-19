<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();

            if ($user->is_locked) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                // Locked by system (too many attempts)
                $message = $user->login_attempts >= 3
                    ? 'Your account has been locked due to too many failed login attempts. Please contact the administrator.'
                    : 'Your account has been locked. Please contact the administrator.';

                return redirect()->route('login')->withErrors([
                    'email' => $message,
                ]);
            }

            if (!$user->is_active) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('login')->withErrors([
                    'email' => 'Your account has been deactivated. Please contact the administrator.',
                ]);
            }
        }

        return $next($request);
    }
}
