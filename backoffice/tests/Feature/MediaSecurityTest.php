<?php

namespace Tests\Feature;

use App\Models\ContentEntry;
use App\Models\MediaAsset;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class MediaSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['geca.media_uploads_enabled' => true]);
        Storage::fake('media');
    }

    private function signIn(array $attributes = []): User
    {
        $user = User::factory()->create(array_merge(['is_admin' => true, 'is_active' => true, 'session_version' => 1], $attributes));
        $this->verifiedAdmin($user);

        return $user;
    }

    private function project(): ContentEntry
    {
        if (! ContentEntry::where('kind', 'projects')->exists()) {
            $this->artisan('geca:import-reference')->assertSuccessful();
        }

        return ContentEntry::where('kind', 'projects')->firstOrFail();
    }

    private function editUrl(): string
    {
        return route('content.edit', ['kind' => 'projects', 'entry' => $this->project()->id]);
    }

    private function upload(array $data)
    {
        $entry = $this->project();

        return $this->put('/administration/projects/'.$entry->id, array_merge([
            'revision' => $entry->revision,
            'source_note' => 'Ajout d’une photo de test, sans publication.',
            'payload' => ['fr' => $entry->source_payload['fr'], 'en' => $entry->source_payload['en']],
        ], $data));
    }

    private function data(?UploadedFile $photo = null): array
    {
        return ['title' => 'Image de test', 'source' => 'Fixture de test, aucune activité GECA', 'credit' => null, 'license' => 'Test seulement', 'alt_fr' => 'Image unie de test', 'alt_en' => 'Solid test image', 'illustrative' => 1, 'photo' => $photo ?? UploadedFile::fake()->image('test.jpg', 1600, 900)];
    }

    public function test_upload_stays_private_and_server_controls_author_and_paths(): void
    {
        $user = $this->signIn();
        $data = $this->data();
        $data['user_id'] = 999;
        $data['path'] = '/public/evil.php';
        $data['id'] = '../outside';
        $this->upload($data)->assertSessionHasNoErrors()->assertRedirect($this->editUrl());
        $media = MediaAsset::firstOrFail();
        $this->assertSame($user->id, $media->user_id);
        $disk = Storage::disk('media');
        $disk->assertExists([$media->id.'/original.bin', $media->id.'/preview.webp']);
        $this->assertSame(0600, fileperms($disk->path($media->id.'/original.bin')) & 0777);
        $this->assertSame('image/webp', getimagesize($disk->path($media->id.'/preview.webp'))['mime']);
        $this->assertSame(1280, $media->width);
        $this->assertSame(720, $media->height);
        $this->get("/administration/medias/$media->id/apercu")->assertOk()->assertHeader('Content-Type', 'image/webp');
        $this->get("/storage/$media->id/preview.webp")->assertNotFound();
        $this->get("/administration/medias/$media->id/original")->assertNotFound();
    }

    public function test_anonymous_non_admin_and_revoked_access_are_refused(): void
    {
        $this->upload($this->data())->assertRedirect('/connexion');
        $this->signIn(['is_admin' => false]);
        $this->upload($this->data())->assertForbidden();
        $user = $this->signIn();
        $this->upload($this->data())->assertSessionHasNoErrors();
        $media = MediaAsset::firstOrFail();
        $user->is_active = false;
        $user->save();
        $this->get("/administration/medias/$media->id/apercu")->assertForbidden();
        $this->get("/administration/medias/$media->id/apercu")->assertRedirect('/connexion');
        $this->assertDatabaseCount('media_assets', 1);
    }

    public function test_fake_images_svg_and_executable_names_are_rejected(): void
    {
        $this->signIn();
        foreach ([
            UploadedFile::fake()->createWithContent('photo.jpg', '<?php echo "danger";'),
            UploadedFile::fake()->createWithContent('photo.svg', '<svg xmlns="http://www.w3.org/2000/svg"><script/></svg>'),
            UploadedFile::fake()->image('photo.php.jpg'),
        ] as $file) {
            $this->upload($this->data($file))->assertSessionHasErrors('photo');
        }
        $this->assertDatabaseCount('media_assets', 0);
        $this->assertSame([], Storage::disk('media')->allFiles());
    }

    public function test_mismatched_extension_and_embedded_php_are_rejected(): void
    {
        $this->signIn();
        $png = UploadedFile::fake()->image('fixture.png')->getContent();
        $this->upload($this->data(UploadedFile::fake()->createWithContent('renamed.jpg', $png)))->assertSessionHasErrors('photo');
        $this->upload($this->data(UploadedFile::fake()->createWithContent('mixed.png', $png.'<?php echo 1;')))->assertSessionHasErrors('photo');
        $this->assertDatabaseCount('media_assets', 0);
    }

    public function test_large_files_and_excessive_dimensions_are_rejected_before_decode(): void
    {
        $this->signIn();
        $this->upload($this->data(UploadedFile::fake()->create('large.jpg', 6145)))->assertSessionHasErrors('photo');
        $png = UploadedFile::fake()->image('fixture.png', 4, 4)->getContent();
        $png = substr_replace($png, pack('N', 7000), 16, 4);
        $this->upload($this->data(UploadedFile::fake()->createWithContent('oversized.png', $png)))->assertSessionHasErrors('photo');
        $this->assertDatabaseCount('media_assets', 0);
    }

    public function test_metadata_is_kept_only_in_private_original(): void
    {
        $this->signIn();
        $png = UploadedFile::fake()->image('fixture.png', 20, 20)->getContent();
        $text = "GPS\0PRIVATE_LOCATION_MARKER";
        $chunk = pack('N', strlen($text)).'tEXt'.$text.pack('N', crc32('tEXt'.$text));
        $png = substr($png, 0, -12).$chunk.substr($png, -12);
        $this->upload($this->data(UploadedFile::fake()->createWithContent('metadata.png', $png)))->assertSessionHasNoErrors();
        $media = MediaAsset::firstOrFail();
        $disk = Storage::disk('media');
        $this->assertStringContainsString('PRIVATE_LOCATION_MARKER', $disk->get($media->id.'/original.bin'));
        $this->assertStringNotContainsString('PRIVATE_LOCATION_MARKER', $disk->get($media->id.'/preview.webp'));
    }

    public function test_missing_processing_capability_fails_closed(): void
    {
        $this->signIn();
        config(['geca.media_uploads_enabled' => false]);
        $this->get($this->editUrl())->assertSee('L’ajout de photos est indisponible')->assertDontSee('type="file"', false);
        $this->upload($this->data())->assertSessionHasErrors('photo');
        $this->assertDatabaseCount('media_assets', 0);
    }

    public function test_description_is_required_and_optional_information_is_escaped(): void
    {
        $this->signIn();
        $data = $this->data();
        unset($data['alt_fr']);
        $this->upload($data)->assertSessionHasErrors('alt_fr');
        $data = $this->data();
        $data['credit'] = '<script>alert(1)</script>';
        $this->upload($data)->assertSessionHasNoErrors();
        $this->get($this->editUrl())->assertDontSee('<script>', false)->assertSee('&lt;script&gt;', false);
    }

    public function test_photo_and_description_are_enough_without_inventing_rights_or_translation(): void
    {
        $user = $this->signIn();
        $this->upload([
            'photo' => UploadedFile::fake()->image('test.jpg'),
            'alt_fr' => 'Image unie de test',
        ])->assertSessionHasNoErrors()->assertRedirect($this->editUrl());
        $asset = MediaAsset::firstOrFail();
        $this->assertSame('Image unie de test', $asset->title);
        $this->assertSame('Non précisée', $asset->source);
        $this->assertSame('Non précisée', $asset->license);
        $this->assertNull($asset->credit);
        $this->assertSame('', $asset->alt_en);
        $this->assertTrue($asset->illustrative);
        $this->assertSame($user->id, $asset->user_id);
        $this->get("/storage/$asset->id/preview.webp")->assertNotFound();
    }

    public function test_quota_refuses_new_files_without_leaving_an_original(): void
    {
        $this->signIn();
        $this->upload($this->data())->assertSessionHasNoErrors();
        $record = MediaAsset::firstOrFail()->getAttributes();
        $rows = [];
        for ($i = 1; $i < 200; $i++) {
            $copy = $record;
            $copy['id'] = (string) Str::uuid();
            $rows[] = $copy;
        }
        DB::table('media_assets')->insert($rows);
        $this->upload($this->data())->assertSessionHasErrors('photo');
        $this->assertCount(2, Storage::disk('media')->allFiles());
        $this->assertDatabaseCount('media_assets', 200);
    }

    public function test_repeated_uploads_are_limited(): void
    {
        $this->signIn();
        for ($i = 0; $i < 4; $i++) {
            $this->upload($this->data(UploadedFile::fake()->image('test.png', 10, 10)))->assertSessionHasNoErrors();
        }
        $this->upload($this->data())->assertStatus(429);
        $this->assertDatabaseCount('media_assets', 4);
    }

    public function test_photo_is_attached_to_each_content_type_and_logged_with_the_text(): void
    {
        $user = $this->signIn();
        $this->project();
        foreach (['projects', 'news', 'team'] as $kind) {
            $entry = ContentEntry::where('kind', $kind)->firstOrFail();
            $payload = array_intersect_key($entry->source_payload, ['fr' => true, 'en' => true]);
            $this->put("/administration/$kind/$entry->id", array_merge($this->data(), [
                'revision' => $entry->revision, 'source_note' => 'Photo de test ajoutée à cette fiche.', 'payload' => $payload,
            ]))->assertSessionHasNoErrors()->assertRedirect();
            $saved = $entry->fresh();
            $asset = MediaAsset::findOrFail($saved->draft_payload['photo_id']);
            $this->assertSame($user->id, $asset->user_id);
            $this->assertSame($entry->source_payload, $saved->source_payload);
            $revision = DB::table('content_revisions')->where('content_entry_id', $entry->id)->first();
            $this->assertSame($asset->id, json_decode($revision->payload, true)['photo_id']);
            $this->get("/administration/$kind/$entry->id/modifier")->assertOk()->assertSee(route('media.preview', $asset));
        }
        $this->assertDatabaseCount('media_assets', 3);
    }

    public function test_linked_news_can_have_its_own_photo_without_changing_the_project(): void
    {
        $this->signIn();
        $project = $this->project();
        $news = ContentEntry::where('kind', 'news')->where('source_key', 'projet-'.$project->source_key)->firstOrFail();
        $payload = [];
        foreach (['fr', 'en'] as $locale) {
            $payload[$locale] = array_intersect_key($project->source_payload[$locale], $news->fields());
        }
        $this->put("/administration/news/$news->id", array_merge($this->data(), [
            'revision' => $news->revision, 'source_note' => 'Photo propre à cette actualité, pour le test.', 'payload' => $payload,
        ]))->assertSessionHasNoErrors();
        $this->assertNotEmpty($news->fresh()->draft_payload['photo_id']);
        $this->assertNull($project->fresh()->draft_payload);
        $this->assertDatabaseCount('media_assets', 1);
    }

    public function test_replacement_keeps_previous_photo_and_text_only_edit_keeps_attachment(): void
    {
        $this->signIn();
        $this->upload($this->data())->assertSessionHasNoErrors();
        $first = $this->project()->draft_payload['photo_id'];
        $this->upload($this->data())->assertSessionHasNoErrors();
        $second = $this->project()->draft_payload['photo_id'];
        $this->assertNotSame($first, $second);
        $this->upload([])->assertSessionHasNoErrors();
        $this->assertSame($second, $this->project()->draft_payload['photo_id']);
        Storage::disk('media')->assertExists([$first.'/original.bin', $first.'/preview.webp', $second.'/preview.webp']);
    }

    public function test_stale_or_invalid_edit_cannot_leave_files_or_change_the_photo(): void
    {
        $this->signIn();
        $this->upload($this->data())->assertSessionHasNoErrors();
        $before = $this->project()->draft_payload;
        $this->upload(array_merge($this->data(), ['revision' => 0]))->assertSessionHasErrors('revision');
        $data = $this->data();
        $data['payload'] = ['fr' => ['title' => ''], 'en' => []];
        $this->upload($data)->assertSessionHasErrors('payload.fr.title');
        $this->assertSame($before, $this->project()->draft_payload);
        $this->assertDatabaseCount('media_assets', 1);
        $this->assertCount(2, Storage::disk('media')->allFiles());
    }

    public function test_old_photo_screen_is_absent_and_attachment_identifiers_cannot_be_forged(): void
    {
        $this->signIn();
        $this->get('/administration/medias')->assertNotFound();
        $this->post('/administration/medias', $this->data())->assertNotFound();
        $this->get('/administration')->assertDontSee('Ouvrir les photos');
        $this->upload($this->data())->assertSessionHasNoErrors();
        $id = $this->project()->draft_payload['photo_id'];
        $this->upload(['photo_id' => (string) Str::uuid()])->assertSessionHasNoErrors();
        $this->assertSame($id, $this->project()->draft_payload['photo_id']);
        $payload = $this->project()->draft_payload;
        $this->upload(['payload' => $payload])->assertSessionHasErrors('payload');
    }

    public function test_original_photo_preview_is_scoped_and_access_is_checked(): void
    {
        $entry = $this->project();
        $url = "/administration/projects/$entry->id/photo";
        $this->get($url)->assertRedirect('/connexion');
        $this->signIn();
        $this->get($url)->assertOk()->assertHeader('Content-Type', 'image/webp');
        $this->get("/administration/team/$entry->id/photo")->assertNotFound();
        $this->signIn(['is_active' => false]);
        $this->get($url)->assertForbidden();
    }

    public function test_failed_history_write_rolls_back_text_photo_and_files(): void
    {
        $this->signIn();
        $entry = $this->project();
        DB::listen(function ($query) {
            if (str_contains($query->sql, 'insert into "content_revisions"')) {
                throw new \RuntimeException('Échec volontaire de l’historique dans le test.');
            }
        });
        $this->withoutExceptionHandling();
        try {
            $this->upload($this->data());
            $this->fail('L’échec de l’historique doit annuler l’enregistrement.');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Échec volontaire de l’historique dans le test.', $exception->getMessage());
        }
        $this->assertNull($entry->fresh()->draft_payload);
        $this->assertDatabaseCount('media_assets', 0);
        $this->assertDatabaseCount('content_revisions', 0);
        $this->assertSame([], Storage::disk('media')->allFiles());
    }
}
