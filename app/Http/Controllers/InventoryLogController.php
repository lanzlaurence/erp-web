<?php

namespace App\Http\Controllers;

use App\Models\InventoryLog;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class InventoryLogController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:inventory-log-view', only: ['inventoryLog']),
        ];
    }

    public function inventoryLog()
    {
        $logs = InventoryLog::with(['material', 'destination', 'transferToDestination', 'user'])
            ->latest()
            ->paginate(20);

        return Inertia::render('activity/inventory-log', ['logs' => $logs]);
    }
}
