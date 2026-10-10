<?php

namespace App\Http\Controllers;

use App\Models\MediaAsset;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function preview(MediaAsset $media, string $size = 'preview')
    {
        abort_unless(in_array($size, ['preview', 'thumbnail'], true), 404);
        $disk = Storage::disk('media');
        $path = $media->id.'/'.$size.'.webp';
        // Compatibilité avec les anciens médias privés, sans réécrire les originaux.
        if ($size === 'thumbnail' && ! $disk->exists($path)) {
            $path = $media->id.'/preview.webp';
        }
        abort_unless($disk->exists($path), 404);

        return response()->file($disk->path($path), [
            'Content-Type' => 'image/webp',
            'Content-Disposition' => 'inline; filename="apercu.webp"',
        ]);
    }
}
