<?php

namespace App\Listeners;

use App\Models\User;
use Illuminate\Auth\Events\Failed;

class HandleFailedLogin
{
    public function handle(Failed $event): void
    {
        if (!isset($event->credentials['email'])) {
            return;
        }

        $user = User::where('email', $event->credentials['email'])
            ->whereNull('deleted_at')
            ->first();

        if (!$user) {
            return;
        }

        $attempts = $user->login_attempts + 1;

        $user->update([
            'login_attempts' => $attempts,
            'is_locked' => $attempts >= 15,
        ]);
    }
}
