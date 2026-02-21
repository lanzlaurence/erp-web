<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;

trait HasEntityLog
{
    public function logCreated(?string $remarks = null): void
    {
        $this->logs()->create([
            'user_id' => Auth::id(),
            'action' => 'created',
            'changes' => null,
            'remarks' => $remarks,
        ]);
    }

    public function logUpdated(array $oldValues, array $newValues, ?string $remarks = null): void
    {
        $changes = [];
        foreach ($newValues as $field => $newValue) {
            $oldValue = $oldValues[$field] ?? null;
            $old = is_array($oldValue) ? json_encode($oldValue) : (string) ($oldValue ?? '');
            $new = is_array($newValue) ? json_encode($newValue) : (string) ($newValue ?? '');
            if ($old !== $new) {
                $changes[] = [
                    'field' => $field,
                    'old' => $old,
                    'new' => $new,
                ];
            }
        }

        if (empty($changes)) return;

        $this->logs()->create([
            'user_id' => Auth::id(),
            'action' => 'updated',
            'changes' => $changes,
            'remarks' => $remarks,
        ]);
    }

    public function logDeleted(?string $remarks = null): void
    {
        $this->logs()->create([
            'user_id' => Auth::id(),
            'action' => 'deleted',
            'changes' => null,
            'remarks' => $remarks,
        ]);
    }
}
