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
            ->get()
            ->map(fn($log) => [
                'id'             => $log->id,
                'created_at'     => $log->created_at,
                'user_name'      => $log->user?->name,
                'loggable_type'  => $log->loggable_type,
                'loggable_id'    => $log->loggable_id,
                'loggable_code'  => optional($log->loggable)->code,
                'action'         => $log->action,
                'from_status'    => $log->from_status,
                'to_status'      => $log->to_status,
                'remarks'        => $log->remarks,
            ]);

        return Inertia::render('activity/transaction-log', ['logs' => $logs]);
    }

    public function inventoryLog()
    {
        $logs = InventoryLog::with(['material', 'location', 'transferLocation', 'user', 'inventory'])
            ->latest()
            ->get()
            ->map(fn($log) => [
                'id'                     => $log->id,
                'movement_code'          => $log->movement_code,
                'created_at'             => $log->created_at,
                'type'                   => $log->type,
                'inventory_id'           => $log->inventory?->id,
                'inventory_code'         => $log->inventory?->code,
                'material_id'            => $log->material?->id,
                'material_name'          => $log->material?->name,
                'material_code'          => $log->material?->code,
                'location_name'          => $log->location?->name,
                'quantity_before'        => (float) $log->quantity_before,
                'quantity_change'        => (float) $log->quantity_change,
                'quantity_after'         => (float) $log->quantity_after,
                'transfer_location_name' => $log->transferLocation?->name,
                'user_name'              => $log->user?->name,
                'remarks'                => $log->remarks,
            ]);

        return Inertia::render('activity/inventory-log', ['logs' => $logs]);
    }
}
