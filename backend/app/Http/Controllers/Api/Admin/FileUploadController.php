<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FileUploadController extends Controller
{
    use ApiResponse;

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|max:10240', // 10MB
            'folder' => 'nullable|string|in:events,news,media,others',
        ]);

        $file = $request->file('image');
        $folder = $request->input('folder', 'uploads');
        
        // Generate filename
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        
        // Store in public directory
        $path = $file->storeAs($folder, $filename, 'public');
        
        // Generate full URL
        $url = asset('storage/' . $path);
        
        return $this->success([
            'url' => $url,
            'path' => $path
        ], 'File uploaded successfully');
    }
}
