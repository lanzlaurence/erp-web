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

            if (is_array($oldValue)) {
                $old = json_encode($oldValue);
            } else {
                $old = trim((string) ($oldValue ?? ''));
            }

            if (is_array($newValue)) {
                $new = json_encode($newValue);
            } else {
                $new = trim((string) ($newValue ?? ''));
            }

            if (is_numeric($old) && is_numeric($new)) {
                $old = (string) (float) $old;
                $new = (string) (float) $new;
            }

            if ($old !== $new) {
                $changes[] = [
                    'field' => $field,
                    'old' => $old,
                    'new' => $new,
                ];
            }
        }

        // Always log the update even if no field changes detected
        $this->logs()->create([
            'user_id' => Auth::id(),
            'action' => 'updated',
            'changes' => empty($changes) ? null : $changes,
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
