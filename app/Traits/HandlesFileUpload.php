<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

trait HandlesFileUpload
{
    /**
     * Upload single file
     */
    public function uploadFile(
        UploadedFile $file,
        string $path = 'uploads',
        string $disk = 'public',
        ?string $oldFile = null
    ): string {
        // Delete old file if exists
        if ($oldFile && Storage::disk($disk)->exists($oldFile)) {
            Storage::disk($disk)->delete($oldFile);
        }

        // Store new file
        return $file->store($path, $disk);
    }

    /**
     * Upload multiple files
     */
    public function uploadFiles(
        array $files,
        string $path = 'uploads',
        string $disk = 'public'
    ): array {
        $uploadedPaths = [];

        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $uploadedPaths[] = $file->store($path, $disk);
            }
        }

        return $uploadedPaths;
    }

    /**
     * Delete file
     */
    public function deleteFile(string $path, string $disk = 'public'): bool
    {
        if (Storage::disk($disk)->exists($path)) {
            return Storage::disk($disk)->delete($path);
        }

        return false;
    }

    /**
     * Get file URL
     */
    public function getFileUrl(string $path, string $disk = 'public'): ?string
    {
        if ($disk === 'public') {
            return Storage::disk($disk)->url($path);
        }

        // For private files, return route to controller
        return route('file.show', ['path' => $path]);
    }
}
