<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

class PreparePhoto
{
    public static function available(): bool
    {
        return config('geca.media_uploads_enabled') && extension_loaded('gd') && function_exists('imagecreatefromstring')
            && function_exists('imagewebp') && (imagetypes() & IMG_WEBP) !== 0;
    }

    public function prepare(UploadedFile $file): array
    {
        $fail = static function (string $message): never {
            throw ValidationException::withMessages(['photo' => $message]);
        };
        if (! self::available()) {
            $fail('L’ajout de photos est indisponible pour le moment. Contactez le responsable du site.');
        }
        $extension = strtolower($file->getClientOriginalExtension());
        $allowed = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'];
        $name = $file->getClientOriginalName();
        if (! isset($allowed[$extension]) || strlen($name) > 200 || preg_match('/[\x00-\x1f:\\\\]/', $name)
            || preg_match('/\.(php\d*|phtml|pht|phar|jsp|aspx?|cgi|exe|sh)(\.|$)/i', $name)) {
            $fail('Utilisez une photo JPEG, PNG ou WebP avec un nom de fichier simple.');
        }
        if (! $file->isValid() || $file->getSize() < 1 || $file->getSize() > 6 * 1024 * 1024) {
            $fail('La photo doit peser au maximum 6 Mo.');
        }
        $raw = file_get_contents($file->getRealPath());
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->buffer($raw);
        $size = @getimagesizefromstring($raw);
        if ($mime !== $allowed[$extension] || ! $size || ($size['mime'] ?? '') !== $mime
            || preg_match('/<\?(?:php|=)/i', $raw)) {
            $fail('Ce fichier ne correspond pas à une photo autorisée.');
        }
        [$width, $height] = $size;
        if ($width < 1 || $height < 1 || $width > 6000 || $height > 6000 || $width * $height > 12000000) {
            $fail('La photo doit rester sous 12 millions de pixels et 6 000 pixels par côté.');
        }
        $limit = ini_parse_quantity(ini_get('memory_limit'));
        if ($limit > 0 && $width * $height * 8 + memory_get_usage(true) + 32 * 1024 * 1024 > $limit) {
            $fail('Cette photo est trop grande pour être traitée. Réduisez sa taille avant de l’ajouter.');
        }
        $decoded = @imagecreatefromstring($raw);
        if (! $decoded) {
            $fail('Cette photo est abîmée ou ne peut pas être ouverte.');
        }
        $scale = min(1, 1280 / max($width, $height));
        $previewWidth = max(1, (int) round($width * $scale));
        $previewHeight = max(1, (int) round($height * $scale));
        $preview = imagecreatetruecolor($previewWidth, $previewHeight);
        try {
            imagealphablending($preview, false);
            imagesavealpha($preview, true);
            imagecopyresampled($preview, $decoded, 0, 0, 0, 0, $previewWidth, $previewHeight, $width, $height);
            ob_start();
            try {
                imagewebp($preview, null, 82);
                $webp = ob_get_contents();
            } finally {
                ob_end_clean();
            }
            $encoded = $webp ? @getimagesizefromstring($webp) : false;
            if (! $encoded || ($encoded['mime'] ?? '') !== 'image/webp') {
                $fail('La photo n’a pas pu être préparée. Elle n’a pas été enregistrée.');
            }

            // Nouvelle image GD : aucun transfert d’EXIF, XMP ou profil ICC depuis l’original.
            return ['original' => $raw, 'preview' => $webp, 'mime' => $mime, 'width' => $previewWidth, 'height' => $previewHeight];
        } finally {
            // La libération des objets GdImage est automatique en PHP 8.
            unset($preview, $decoded);
        }
    }
}
