<?php

namespace Tests\Feature;

use App\Services\PreparePhoto;
use Illuminate\Http\UploadedFile;
use Random\Engine\Mt19937;
use Random\Randomizer;
use Tests\TestCase;

class PhotoOptimizationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['geca.media_uploads_enabled' => true]);
    }

    public function test_detailed_photo_has_bounded_weight_and_keeps_private_original(): void
    {
        $image = imagecreatetruecolor(1024, 1024);
        $random = new Randomizer(new Mt19937(20261010));
        for ($y = 0; $y < 1024; $y++) {
            $row = $random->getBytes(1024 * 3);
            for ($x = 0; $x < 1024; $x++) {
                $offset = $x * 3;
                imagesetpixel($image, $x, $y, (ord($row[$offset]) << 16) | (ord($row[$offset + 1]) << 8) | ord($row[$offset + 2]));
            }
        }
        // La fixture doit elle aussi satisfaire le contrôle anti-code existant.
        foreach ([95, 94, 93, 92] as $quality) {
            ob_start();
            imagejpeg($image, null, $quality);
            $original = ob_get_clean();
            if (! preg_match('/<\?(?:php|=)/i', $original)) {
                break;
            }
        }
        $this->assertDoesNotMatchRegularExpression('/<\?(?:php|=)/i', $original);
        foreach ([25, 24, 23, 22] as $quality) {
            ob_start();
            imagejpeg($image, null, $quality);
            $compressed = ob_get_clean();
            if (! preg_match('/<\?(?:php|=)/i', $compressed)) {
                break;
            }
        }
        $this->assertDoesNotMatchRegularExpression('/<\?(?:php|=)/i', $compressed);
        unset($image);
        $prepared = app(PreparePhoto::class)->prepare(UploadedFile::fake()->createWithContent('detail.jpg', $original));
        $this->assertSame($original, $prepared['original']);
        $this->assertLessThanOrEqual(250 * 1024, strlen($prepared['preview']));
        $this->assertLessThanOrEqual(16 * 1024, strlen($prepared['thumbnail']));
        $this->assertLessThan(strlen($original), strlen($prepared['preview']));
        $this->assertLessThan(1024, $prepared['width']);
        $this->assertSame($prepared['width'], $prepared['height']);
        $this->assertSame('image/webp', getimagesizefromstring($prepared['preview'])['mime']);
        $this->assertLessThanOrEqual(192, getimagesizefromstring($prepared['thumbnail'])[0]);
        $alreadyLight = app(PreparePhoto::class)->prepare(UploadedFile::fake()->createWithContent('compressed.jpg', $compressed));
        $this->assertLessThanOrEqual(strlen($compressed), strlen($alreadyLight['preview']));
        $this->assertSame($compressed, $alreadyLight['original']);
    }

    public function test_small_transparent_image_is_not_enlarged_or_given_a_background(): void
    {
        $image = imagecreatetruecolor(64, 32);
        imagealphablending($image, false);
        imagesavealpha($image, true);
        imagefill($image, 0, 0, imagecolorallocatealpha($image, 20, 160, 80, 127));
        imagefilledrectangle($image, 16, 8, 48, 24, imagecolorallocatealpha($image, 20, 160, 80, 0));
        ob_start();
        imagepng($image);
        $original = ob_get_clean();
        unset($image);
        $prepared = app(PreparePhoto::class)->prepare(UploadedFile::fake()->createWithContent('transparent.png', $original));
        $this->assertSame(64, $prepared['width']);
        $this->assertSame(32, $prepared['height']);
        foreach (['preview', 'thumbnail'] as $variant) {
            $decoded = imagecreatefromstring($prepared[$variant]);
            $this->assertSame(64, imagesx($decoded));
            $this->assertSame(32, imagesy($decoded));
            $this->assertSame(127, imagecolorsforindex($decoded, imagecolorat($decoded, 0, 0))['alpha']);
            unset($decoded);
        }
    }
}
