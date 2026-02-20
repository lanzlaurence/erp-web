<?php

namespace App\Http\Controllers;

use App\Models\TransactionLog;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class TransactionLogController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:transaction-log-view', only: ['transactionLog']),
        ];
    }

    public function transactionLog()
    {
        $logs = TransactionLog::with(['user', 'loggable'])
            ->latest()
            ->paginate(20);

        return Inertia::render('activity/transaction-log', ['logs' => $logs]);
    }
}
