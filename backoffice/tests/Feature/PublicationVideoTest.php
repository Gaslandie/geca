<?php

namespace Tests\Feature;

use App\Models\ContentEntry;
use App\Models\User;
use App\Services\PrepareVideo;
use App\Services\PublicPublication;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class PublicationVideoTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $user = User::factory()->create(['role' => 'admin', 'is_admin' => true, 'is_active' => true, 'session_version' => 1]);
        $this->verifiedAdmin($user);
        Storage::fake('local');

        return $user;
    }

    private function file(string $name = 'video.mp4'): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, file_get_contents(dirname(base_path()).'/public/videos/geca-projets-20261015-1.mp4'));
    }

    private function data(string $kind = 'news'): array
    {
        return ['creation_token' => $this->get("/administration/$kind/ajouter")->viewData('creationToken'),
            'payload' => ['fr' => ['title' => 'TEST vidéo', 'description' => 'Fixture technique uniquement.']],
            'source_note' => 'Fixture technique sur base jetable.', 'video' => $this->file()];
    }

    public function test_upload_private_playback_public_snapshot_replacement_removal_and_history(): void
    {
        $this->admin();
        $this->post('/administration/news', $this->data())->assertSessionHasNoErrors();
        $entry = ContentEntry::firstOrFail();
        $old = $entry->draft_payload['video']['id'];
        $url = "/administration/news/$entry->id/video";
        $this->get($url)->assertOk()->assertHeader('Content-Type', 'video/mp4')->assertHeader('Cache-Control', 'no-store, private');
        $this->get($url, ['Range' => 'bytes=0-99'])->assertStatus(206);
        $this->get("/administration/projects/$entry->id/video")->assertNotFound();
        $snapshot = app(PublicPublication::class)->candidate();
        $video = $snapshot['entries'][0]['video'];
        $bytes = base64_decode($snapshot['media'][$video['sha256']]);
        $this->assertSame(hash('sha256', $bytes), $video['sha256']);
        $this->assertSame(832, $video['width']);
        $this->assertStringNotContainsString($old, json_encode($snapshot));
        $this->assertStringNotContainsString('source_note', json_encode($snapshot));
        $edit = ['revision' => 1, 'payload' => ['fr' => $entry->draft_payload['fr']], 'source_note' => 'Remplacement technique de la vidéo.', 'video' => $this->file()];
        $this->put("/administration/news/$entry->id", $edit)->assertSessionHasNoErrors();
        $this->assertNotSame($old, $entry->fresh()->draft_payload['video']['id']);
        Storage::disk('local')->assertExists('publication-videos/'.$old.'.mp4');
        $edit['revision'] = 2;
        unset($edit['video']);
        $edit['remove_video'] = '1';
        $this->put("/administration/news/$entry->id", $edit)->assertSessionHasNoErrors();
        $this->get($url)->assertNotFound();
        $this->assertNull(app(PublicPublication::class)->candidate()['entries'][0]['video']);
        $this->assertDatabaseCount('content_revisions', 3);
        $entry->delete();
        $this->get($url)->assertNotFound();
    }

    public function test_projects_and_news_keep_both_photo_and_video_in_publication(): void
    {
        $this->admin();
        config(['geca.media_uploads_enabled' => true]);
        Storage::fake('media');
        foreach (['projects', 'news'] as $kind) {
            $data = $this->data($kind);
            $data['photo'] = UploadedFile::fake()->image('photo.jpg', 100, 100);
            $this->post("/administration/$kind", $data)->assertSessionHasNoErrors();
        }
        $snapshot = app(PublicPublication::class)->candidate();
        foreach ($snapshot['entries'] as $entry) {
            $this->assertArrayHasKey('photo', $entry);
            $this->assertArrayHasKey('video', $entry);
        }
        $this->assertDatabaseCount('media_assets', 2);
    }

    public function test_invalid_extension_content_size_team_and_conflicting_actions_are_refused(): void
    {
        $this->admin();
        $data = $this->data();
        foreach ([$this->file('video.php.mp4'), UploadedFile::fake()->createWithContent('video.mp4', '<?php echo 1;'), UploadedFile::fake()->create('video.mp4', 20481, 'video/mp4')] as $file) {
            $data['video'] = $file;
            $this->post('/administration/news', $data)->assertSessionHasErrors('video');
        }
        $data['video'] = $this->file();
        $data['remove_video'] = 1;
        $this->post('/administration/news', $data)->assertSessionHasErrors('video');
        $data = $this->data('team');
        $data['payload'] = ['fr' => ['name' => 'TEST', 'role' => 'TEST']];
        $this->post('/administration/team', $data)->assertSessionHasErrors('video');
        $this->assertDatabaseCount('content_entries', 0);
        $this->assertSame([], Storage::disk('local')->allFiles('publication-videos'));
    }

    public function test_denied_accounts_cannot_upload_or_read_videos_and_stale_edits_do_not_store_files(): void
    {
        $user = $this->admin();
        $data = $this->data();
        $this->post('/administration/news', $data)->assertSessionHasNoErrors();
        $entry = ContentEntry::firstOrFail();
        $before = Storage::disk('local')->allFiles('publication-videos');
        $edit = ['revision' => 0, 'source_note' => 'Essai périmé de remplacement.', 'payload' => ['fr' => $entry->draft_payload['fr']], 'video' => $this->file()];
        $this->put("/administration/news/$entry->id", $edit)->assertSessionHasErrors('revision');
        $this->assertSame($before, Storage::disk('local')->allFiles('publication-videos'));
        $user->session_version++;
        $user->save();
        $this->get("/administration/news/$entry->id/video")->assertForbidden();
        $this->post('/administration/news', $data)->assertRedirect('/connexion');
        $this->verifiedAdmin($user->fresh());
        $user->is_active = false;
        $user->save();
        $this->get("/administration/news/$entry->id/video")->assertForbidden();
    }

    public function test_viewers_can_read_shared_geca_videos_but_cannot_upload_and_revoked_accounts_are_refused(): void
    {
        $admin = $this->admin();
        $this->post('/administration/news', $this->data())->assertSessionHasNoErrors();
        $entry = ContentEntry::firstOrFail();
        $viewer = User::factory()->create(['role' => 'reader', 'is_admin' => false, 'is_active' => true, 'session_version' => 1]);
        $this->verifiedAdmin($viewer);
        $this->get("/administration/news/$entry->id/video")->assertOk();
        $this->post('/administration/news', ['video' => $this->file()])->assertForbidden();
        $this->verifiedAdmin($admin->fresh());
        $admin->role = null;
        $admin->is_admin = false;
        $admin->save();
        $this->get("/administration/news/$entry->id/video")->assertForbidden();
    }

    public function test_quota_refuses_new_files_without_losing_previous_video(): void
    {
        $this->admin();
        $this->post('/administration/news', $this->data())->assertSessionHasNoErrors();
        $entry = ContentEntry::firstOrFail();
        $path = Storage::disk('local')->path('publication-videos/quota.bin');
        $handle = fopen($path, 'wb');
        ftruncate($handle, 200 * 1024 * 1024);
        fclose($handle);
        $this->put("/administration/news/$entry->id", ['revision' => 1, 'source_note' => 'Essai technique de dépassement.', 'payload' => ['fr' => $entry->draft_payload['fr']], 'video' => $this->file()])->assertSessionHasErrors('video');
        $this->assertSame($entry->draft_payload, $entry->fresh()->draft_payload);
        $this->assertDatabaseCount('content_revisions', 1);
    }

    public function test_container_metadata_are_removed_and_truncated_files_refused(): void
    {
        $service = new PrepareVideo;
        $raw = file_get_contents(dirname(base_path()).'/public/videos/geca-projets-20261015-1.mp4');
        $raw .= pack('N', 20).'uuid'.'PRIVATE-DATA';
        // UUID de longueur exacte, conservé comme espace libre rempli de zéros.
        $clean = $service->inspect($raw);
        $this->assertStringNotContainsString('PRIVATE-DATA', $clean['bytes']);
        $this->assertSame($clean, $service->inspect($clean['bytes']));
        $this->expectException(ValidationException::class);
        $service->inspect(substr($raw, 0, -30));
    }
}
