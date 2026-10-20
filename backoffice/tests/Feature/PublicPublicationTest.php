<?php

namespace Tests\Feature;

use App\Models\ContentEntry;
use App\Models\MediaAsset;
use App\Models\User;
use App\Services\PublicPublication;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class PublicPublicationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        Storage::fake('media');
    }

    private function admin(): User
    {
        $user = User::factory()->create(['role' => 'admin', 'is_admin' => true, 'is_active' => true, 'session_version' => 1]);
        session()->forget('password_hash_web');
        $this->verifiedAdmin($user);
        $this->withSession(['password_hash_web' => $user->getAuthPassword()]);

        return $user;
    }

    private function entry(): ContentEntry
    {
        $entry = new ContentEntry;
        $entry->kind = 'projects';
        $entry->source_key = 'kounounkan';
        $entry->source_payload = ['fr' => ['title' => 'Ancien titre', 'description' => 'Description conservée'], 'en' => ['title' => 'Old title'], 'source_note' => 'NOTE PRIVÉE'];
        $entry->draft_payload = ['fr' => ['title' => 'Titre corrigé', 'description' => 'Description conservée'], 'en' => ['title' => 'Old title']];
        $entry->save();

        return $entry;
    }

    private function submit()
    {
        $service = app(PublicPublication::class);

        return $this->post(route('publication.store'), ['confirm' => '1', 'fingerprint' => $service->fingerprint($service->candidate())]);
    }

    public function test_snapshot_is_private_immutable_minimal_and_only_marked_published_after_confirmation(): void
    {
        $this->admin();
        $entry = $this->entry();
        $this->get(route('publication.index'))->assertOk()->assertSee('Titre corrigé');
        $this->submit()->assertRedirect(route('publication.index'));
        $service = app(PublicPublication::class);
        $packet = $service->worker('fetch');
        $this->assertTrue($packet['pending']);
        $this->assertSame(['fr' => ['title' => 'Titre corrigé']], $packet['snapshot']['entries'][0]['texts']);
        $this->assertStringNotContainsString('NOTE PRIVÉE', json_encode($packet));
        $this->assertArrayNotHasKey('actor', $packet);
        $this->assertNull($service->state()['published']);
        $entry->draft_payload = ['fr' => ['title' => 'Brouillon suivant']];
        $entry->save();
        $this->assertSame($packet, $service->worker('fetch'));
        $service->worker('authorize', $packet['id'], $packet['hash']);
        $service->worker('complete', $packet['id'], $packet['hash']);
        $this->assertSame('published', $service->state()['current']['status']);
        $this->assertFalse($service->worker('fetch')['pending']);
    }

    public function test_stale_review_missing_confirmation_and_double_publication_are_refused(): void
    {
        $this->admin();
        $entry = $this->entry();
        $s = app(PublicPublication::class);
        $hash = $s->fingerprint($s->candidate());
        $entry->draft_payload = ['fr' => ['title' => 'Autre titre']];
        $entry->save();
        $this->post(route('publication.store'), ['confirm' => '1', 'fingerprint' => $hash])->assertSessionHasErrors('publication');
        $this->post(route('publication.store'), ['fingerprint' => $hash])->assertSessionHasErrors('confirm');
        $this->submit()->assertSessionHasNoErrors();
        $this->submit()->assertSessionHasErrors('publication');
    }

    public function test_anonymous_reader_editor_and_revoked_admin_cannot_publish(): void
    {
        $this->get(route('publication.index'))->assertRedirect('/connexion');
        $this->post(route('publication.store'))->assertRedirect('/connexion');
        foreach (['reader', 'editor'] as $role) {
            $user = User::factory()->create(['role' => $role, 'is_admin' => false, 'is_active' => true, 'session_version' => 1]);
            session()->forget('password_hash_web');
            $this->verifiedAdmin($user);
            $this->withSession(['password_hash_web' => $user->getAuthPassword()]);
            $this->get(route('publication.index'))->assertForbidden();
            $this->post(route('publication.store'))->assertForbidden();
        }
        $admin = $this->admin();
        $admin->is_active = false;
        $admin->save();
        $this->post(route('publication.store'))->assertForbidden();
    }

    public function test_revocation_cancels_pending_work_and_wrong_acknowledgement_is_refused(): void
    {
        $admin = $this->admin();
        $this->entry();
        $this->submit();
        $s = app(PublicPublication::class);
        $packet = $s->worker('fetch');
        try {
            $s->worker('complete', $packet['id'], str_repeat('0', 64));
            $this->fail('Hash incorrect accepté');
        } catch (\RuntimeException) {
            $this->assertNull($s->state()['published']);
        }
        $admin->session_version++;
        $admin->save();
        try {
            $s->worker('fetch');
            $this->fail('Droits révoqués acceptés');
        } catch (\RuntimeException) {
            $this->assertSame('cancelled', $s->state()['current']['status']);
        }
    }

    public function test_deleted_entries_are_explicit_and_failure_keeps_the_published_snapshot(): void
    {
        $this->admin();
        $entry = $this->entry();
        $this->submit();
        $s = app(PublicPublication::class);
        $first = $s->worker('fetch');
        $s->worker('complete', $first['id'], $first['hash']);
        $entry->delete();
        $this->submit();
        $second = $s->worker('fetch');
        $this->assertSame(['kind' => 'projects', 'key' => 'kounounkan', 'deleted' => true], $second['snapshot']['entries'][0]);
        $s->worker('fail', $second['id'], $second['hash']);
        $this->assertSame($first['id'], $s->state()['published']['id']);
        $this->assertSame($first['snapshot'], $s->worker('fetch')['snapshot']);
    }

    public function test_reference_sync_adds_only_missing_public_records_without_overwriting_drafts_or_restoring_trash(): void
    {
        $existing = $this->entry();
        $before = $existing->fresh()->toArray();
        $s = app(PublicPublication::class);
        $input = ['images' => [], 'entries' => [
            ['kind' => 'projects', 'key' => 'kounounkan', 'payload' => ['fr' => ['title' => 'Autre référence'], 'en' => ['title' => 'Other']]],
            ['kind' => 'team', 'key' => 'membre-source', 'payload' => ['fr' => ['name' => 'TEST', 'role' => 'TEST'], 'en' => ['name' => 'TEST', 'role' => 'TEST']]],
        ]];
        $this->assertSame(['added' => 1], $s->importReference($input));
        $this->assertSame($before, $existing->fresh()->toArray());
        ContentEntry::where('source_key', 'membre-source')->firstOrFail()->delete();
        $this->assertSame(['added' => 0], $s->importReference($input));
        $this->assertSame(1, ContentEntry::onlyTrashed()->count());
        $input['images'] = ['/images/example.jpg' => [['src' => '/../private.webp', 'width' => 192]]];
        $this->expectException(\RuntimeException::class);
        $s->importReference($input);
    }

    public function test_only_optimized_photo_is_exported_and_rights_are_rechecked_before_delivery(): void
    {
        $user = $this->admin();
        $entry = $this->entry();
        $image = imagecreatetruecolor(12, 12);
        ob_start();
        imagewebp($image);
        $bytes = ob_get_clean();
        $id = (string) Str::uuid();
        MediaAsset::unguarded(fn () => MediaAsset::create([
            'id' => $id, 'user_id' => $user->id, 'title' => 'TEST',
            'source' => 'SOURCE PRIVÉE', 'license' => 'NOTE PRIVÉE', 'credit' => 'CRÉDIT INTERNE',
            'alt_fr' => 'Photo TEST', 'alt_en' => 'TEST photo', 'mime' => 'image/webp',
            'width' => 12, 'height' => 12, 'original_bytes' => 20,
            'preview_bytes' => strlen($bytes), 'sha256' => hash('sha256', $bytes),
        ]));
        Storage::disk('media')->put($id.'/original.bin', 'ORIGINAL PRIVÉ');
        Storage::disk('media')->put($id.'/preview.webp', $bytes);
        $entry->draft_payload = [...$entry->draft_payload, 'photo_id' => $id];
        $entry->save();
        $this->submit()->assertRedirect();
        $service = app(PublicPublication::class);
        $packet = $service->worker('fetch');
        $this->assertSame($bytes, base64_decode($packet['snapshot']['media'][hash('sha256', $bytes)]));
        $this->assertStringNotContainsString('PRIV', json_encode($packet));
        $this->assertStringNotContainsString('INTERNE', json_encode($packet));
        $user->session_version++;
        $user->save();
        $this->expectException(\RuntimeException::class);
        $service->worker('authorize', $packet['id'], $packet['hash']);
    }
}
