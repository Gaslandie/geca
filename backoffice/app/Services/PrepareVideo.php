<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;

/** Contrôle borné du conteneur MP4 ; ne remplace pas un antivirus ou un décodage complet. */
class PrepareVideo
{
    private function reject(): never
    {
        throw ValidationException::withMessages(['video' => 'Cette vidéo ne convient pas. Utilisez un fichier MP4 H.264, avec son AAC facultatif, de 20 Mo maximum.']);
    }

    public function prepare(UploadedFile $file): array
    {
        if (preg_match('/\.(php\d*|phtml|phar|exe|sh)(\.|$)/i', $file->getClientOriginalName())) {
            $this->reject();
        }
        if (! $file->isValid() || strtolower($file->getClientOriginalExtension()) !== 'mp4'
            || ! in_array($file->getMimeType(), ['video/mp4', 'application/mp4'], true) || $file->getSize() > 20 * 1024 * 1024) {
            $this->reject();
        }

        return $this->inspect(file_get_contents($file->getRealPath()));
    }

    public function inspect(string $bytes): array
    {
        if (strlen($bytes) < 32 || strlen($bytes) > 20 * 1024 * 1024) {
            $this->reject();
        }
        $count = 0;
        $dimensions = null;
        $video = false;
        $top = [];
        $metadata = [];
        $walk = function (int $start, int $end, int $depth = 0) use (&$walk, &$bytes, &$count, &$dimensions, &$video, &$top, &$metadata) {
            if ($depth > 10) {
                $this->reject();
            }
            for ($offset = $start; $offset < $end;) {
                if (++$count > 20000 || $end - $offset < 8) {
                    $this->reject();
                }
                $size = unpack('N', substr($bytes, $offset, 4))[1];
                $type = substr($bytes, $offset + 4, 4);
                // Pas de taille implicite ni d'entier 64 bits : fichiers bornés à 20 Mio.
                if ($size < 8 || $size > $end - $offset) {
                    $this->reject();
                }
                if ($depth === 0) {
                    if (! in_array($type, ['ftyp', 'moov', 'mdat', 'free', 'wide', 'skip', 'uuid'], true)) {
                        $this->reject();
                    }
                    $top[$type] = ($top[$type] ?? 0) + 1;
                    if ($offset === 0 && ($type !== 'ftyp' || $size < 16 || ! in_array(substr($bytes, $offset + 8, 4), ['isom', 'iso2', 'mp41', 'mp42', 'avc1'], true))) {
                        $this->reject();
                    }
                }
                if (in_array($type, ['udta', 'meta', 'uuid', 'free', 'skip'], true)) {
                    // Remplacer les métadonnées sans déplacer les offsets des échantillons.
                    $metadata[] = [$offset + 4, $size - 4];
                } elseif (in_array($type, ['moov', 'trak', 'mdia', 'minf', 'stbl', 'dinf', 'edts'], true)) {
                    $walk($offset + 8, $offset + $size, $depth + 1);
                } elseif ($type === 'tkhd') {
                    if ($size < 92) {
                        $this->reject();
                    }
                    $w = unpack('N', substr($bytes, $offset + $size - 8, 4))[1] >> 16;
                    $h = unpack('N', substr($bytes, $offset + $size - 4, 4))[1] >> 16;
                    if ($w && $h) {
                        if ($w > 3840 || $h > 3840 || $dimensions !== null) {
                            $this->reject();
                        }
                        $dimensions = [$w, $h];
                    }
                } elseif ($type === 'stsd') {
                    if ($size < 16) {
                        $this->reject();
                    }
                    $entries = unpack('N', substr($bytes, $offset + 12, 4))[1];
                    if ($entries !== 1 || $size < 32) {
                        $this->reject();
                    }
                    $codec = substr($bytes, $offset + 20, 4);
                    $sampleSize = unpack('N', substr($bytes, $offset + 16, 4))[1];
                    if ($sampleSize !== $size - 16 || ! in_array($codec, ['avc1', 'mp4a'], true)) {
                        $this->reject();
                    }
                    if ($codec === 'avc1') {
                        if ($sampleSize < 86 || ! str_contains(substr($bytes, $offset + 16, $sampleSize), 'avcC')) {
                            $this->reject();
                        }
                        $video = true;
                    }
                } elseif ($type === 'dref') {
                    // Uniquement des données locales au fichier, jamais d'URL externe.
                    if ($size !== 28 || substr($bytes, $offset + 12, 16) !== pack('N', 1).pack('N', 12).'url '.pack('N', 1)) {
                        $this->reject();
                    }
                }
                $offset += $size;
            }
        };
        $walk(0, strlen($bytes));
        if (($top['ftyp'] ?? 0) !== 1 || ($top['moov'] ?? 0) !== 1 || ($top['mdat'] ?? 0) < 1 || ! $video || ! $dimensions) {
            $this->reject();
        }

        $clean = '';
        $cursor = 0;
        foreach ($metadata as [$offset, $length]) {
            $clean .= substr($bytes, $cursor, $offset - $cursor).'free'.str_repeat("\0", $length - 4);
            $cursor = $offset + $length;
        }
        $clean .= substr($bytes, $cursor);

        return ['bytes' => $clean, 'width' => $dimensions[0], 'height' => $dimensions[1]];
    }
}
