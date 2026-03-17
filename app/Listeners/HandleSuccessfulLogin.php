<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;

class HandleSuccessfulLogin
{
    public function handle(Login $event): void
    {
        $event->user->update([
            'login_attempts' => 0,
        ]);
    }
}
