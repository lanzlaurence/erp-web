<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class PasswordChangeController extends Controller
{
    public function index()
    {
        return Inertia::render('auth/change-password');
    }

    public function update(Request $request)
    {
        $request->validate([
            'password' => ['required', 'confirmed', Password::min(8)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            ],
        ]);

        Auth::user()->update([
            'password' => Hash::make($request->password),
            'password_changed_at' => now(),
            'force_password_change' => false,
        ]);

        return redirect()->route('dashboard')->with('success', 'Password changed successfully');
    }
}
