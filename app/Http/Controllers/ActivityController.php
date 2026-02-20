<?php

namespace App\Http\Controllers;

use App\Models\InventoryLog;
use App\Models\TransactionLog;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class ActivityController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:inventory-log-view',   only: ['inventoryLog']),
            new Middleware('permission:transaction-log-view', only: ['transactionLog']),
        ];
    }

    public function inventoryLog()
    {
        $logs = InventoryLog::with(['material', 'destination', 'transferToDestination', 'user', 'inventory'])
            ->latest()
            ->paginate(20);

        return Inertia::render('activity/inventory-log', ['logs' => $logs]);
    }

    public function transactionLog()
    {
        $logs = TransactionLog::with(['user', 'loggable'])
            ->latest()
            ->paginate(20);

        return Inertia::render('activity/transaction-log', ['logs' => $logs]);
    }
}
