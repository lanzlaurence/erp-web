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
            new Middleware('permission:activity-transaction-log', only: ['transactionLog']),
            new Middleware('permission:activity-inventory-log',   only: ['inventoryLog']),
        ];
    }

    public function transactionLog()
    {
        $logs = TransactionLog::with(['user', 'loggable'])
            ->latest()
            ->paginate(20);

        return Inertia::render('activity/transaction-log', ['logs' => $logs]);
    }

    public function inventoryLog()
    {
        $logs = InventoryLog::with(['material', 'location', 'transferToLocation', 'user', 'inventory'])
            ->latest()
            ->paginate(20);

        return Inertia::render('activity/inventory-log', ['logs' => $logs]);
    }
}
