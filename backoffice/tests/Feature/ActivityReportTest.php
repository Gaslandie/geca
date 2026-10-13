<?php

namespace Tests\Feature;

use App\Models\ActivityReport;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class ActivityReportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('reports');
    }

    private function admin(): User
    {
        $user = User::factory()->create(['is_admin' => true, 'is_active' => true, 'session_version' => 1]);
        $this->verifiedAdmin($user);

        return $user;
    }

    private function pdf(string $text = 'TEST uniquement'): UploadedFile
    {
        return UploadedFile::fake()->createWithContent('rapport.pdf', "%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n% $text\n%%EOF\n");
    }

    private function data(array $extra = []): array
    {
        $page = $this->get('/administration/rapports/ajouter')->assertOk();

        return array_replace([
            'creation_token' => $page->viewData('creationToken'), 'title' => 'TEST rapport, base jetable',
            'start_date' => '2025-01-01', 'end_date' => '2025-12-31', 'description' => 'Aucun fait GECA.', 'document' => $this->pdf(),
        ], $extra);
    }

    private function createReport(): ActivityReport
    {
        $this->post('/administration/rapports', $this->data())->assertSessionHasNoErrors();

        return ActivityReport::firstOrFail();
    }

    public function test_add_edit_replace_archive_restore_and_shared_admin_access(): void
    {
        $user = $this->admin();
        $data = $this->data(['id' => Str::uuid(), 'created_by' => 987, 'file_path' => '../../secret', 'sha256' => 'forged']);
        $this->post('/administration/rapports', $data)->assertSessionHasNoErrors();
        $report = ActivityReport::firstOrFail();
        $this->assertSame($user->id, $report->created_by);
        $this->assertNotSame($data['id'], $report->id);
        $original = $report->file_path;
        Storage::disk('reports')->assertExists($original);
        $this->get('/administration')->assertSee('Rapports d’activités')->assertSee('Ouvrir les rapports');
        $this->get('/administration/rapports')->assertSee($report->title);
        $response = $this->get("/administration/rapports/$report->id/telecharger")->assertOk();
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->assertStringContainsString('attachment;', $response->headers->get('Content-Disposition'));
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        $other = $this->admin();
        $this->get("/administration/rapports/$report->id/modifier")->assertOk();
        $edit = ['title' => 'TEST corrigé', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31', 'revision' => 1];
        $this->put("/administration/rapports/$report->id", $edit)->assertSessionHasNoErrors();
        $this->assertSame($original, $report->fresh()->file_path);
        $this->put("/administration/rapports/$report->id", array_replace($edit, ['revision' => 2, 'document' => $this->pdf('TEST remplacé')]))->assertSessionHasNoErrors();
        $this->assertNotSame($original, $report->fresh()->file_path);
        Storage::disk('reports')->assertExists($original);
        $this->delete("/administration/rapports/$report->id", ['revision' => 3, 'confirm' => 1])->assertSessionHasNoErrors();
        $this->assertTrue($report->fresh()->trashed());
        $this->assertSame(4, $report->fresh()->revision);
        $this->get('/administration/rapports')->assertDontSee('TEST corrigé');
        $this->get('/administration/rapports/archives')->assertSee('TEST corrigé');
        $this->get("/administration/rapports/$report->id/telecharger")->assertNotFound();
        $this->post("/administration/rapports/$report->id/restaurer", ['revision' => 4])->assertSessionHasNoErrors();
        $this->assertFalse($report->fresh()->trashed());
        $this->assertSame(5, $report->fresh()->revision);
        $this->assertDatabaseCount('activity_report_revisions', 5);
        $this->assertDatabaseHas('activity_report_revisions', ['revision' => 1, 'user_id' => $user->id]);
        $this->assertDatabaseHas('activity_report_revisions', ['revision' => 5, 'user_id' => $other->id]);
    }

    public function test_bad_files_fields_quota_and_stale_edits_are_refused(): void
    {
        $this->admin();
        foreach ([
            UploadedFile::fake()->createWithContent('fake.pdf', '<?php echo 1;'),
            UploadedFile::fake()->createWithContent('fake.php', "%PDF-1.7\n%%EOF\n"),
            UploadedFile::fake()->createWithContent('incomplete.pdf', '%PDF-1.7 not complete'),
            UploadedFile::fake()->createWithContent('script.pdf', "%PDF-1.7\n<?php echo 1;\n%%EOF\n"),
            UploadedFile::fake()->create('large.pdf', 10241, 'application/pdf'),
        ] as $file) {
            $this->post('/administration/rapports', $this->data(['document' => $file]))->assertSessionHasErrors('document');
        }
        $this->assertDatabaseCount('activity_reports', 0);
        $this->assertSame([], Storage::disk('reports')->allFiles());
        $this->post('/administration/rapports', $this->data(['title' => [], 'start_date' => '']))->assertSessionHasErrors(['title', 'start_date']);
        // Nouvelle fenêtre d'essai ; la limite réelle est vérifiée séparément.
        $this->travel(61)->seconds();
        config(['geca.reports_quota_bytes' => 1]);
        $this->post('/administration/rapports', $this->data())->assertSessionHasErrors('document');
        config(['geca.reports_quota_bytes' => 250 * 1024 * 1024]);
        $report = $this->createReport();
        $this->put("/administration/rapports/$report->id", ['title' => 'TEST ancien', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31', 'revision' => 99, 'document' => $this->pdf()])->assertSessionHasErrors('revision');
        $this->delete("/administration/rapports/$report->id", ['revision' => 1])->assertSessionHasErrors('confirm');
        $this->assertSame(1, $report->fresh()->revision);
        $this->assertCount(1, Storage::disk('reports')->allFiles());
    }

    public function test_duplicate_expired_and_other_account_tokens_are_refused(): void
    {
        $first = $this->admin();
        $data = $this->data();
        $this->post('/administration/rapports', $data)->assertSessionHasNoErrors();
        $this->post('/administration/rapports', $data)->assertSessionHasErrors('creation_token');
        $this->assertDatabaseCount('activity_reports', 1);
        $expired = $this->data();
        $this->withSession(['report_creation' => [$expired['creation_token'] => ['user' => $first->id, 'expires' => time() - 1]]]);
        $this->post('/administration/rapports', $expired)->assertSessionHasErrors('creation_token');
        $otherAccount = $this->data();
        $this->admin();
        $this->post('/administration/rapports', $otherAccount)->assertSessionHasErrors('creation_token');
        $this->assertDatabaseCount('activity_reports', 1);
    }

    public function test_all_routes_require_login_and_direct_or_unknown_files_are_not_public(): void
    {
        $uuid = (string) Str::uuid();
        foreach (['/administration/rapports', '/administration/rapports/ajouter', '/administration/rapports/archives', "/administration/rapports/$uuid/modifier", "/administration/rapports/$uuid/telecharger"] as $url) {
            $this->get($url)->assertRedirect('/connexion');
        }
        $this->post('/administration/rapports')->assertRedirect('/connexion');
        $this->put("/administration/rapports/$uuid")->assertRedirect('/connexion');
        $this->delete("/administration/rapports/$uuid")->assertRedirect('/connexion');
        $this->post("/administration/rapports/$uuid/restaurer")->assertRedirect('/connexion');
        $this->admin();
        $this->get("/administration/rapports/$uuid/modifier")->assertNotFound();
        $this->get("/administration/rapports/$uuid/telecharger")->assertNotFound();
        $report = $this->createReport();
        $this->get('/storage/reports/'.$report->file_path)->assertNotFound();
        $this->get('/administration/rapports/not-a-uuid/telecharger')->assertNotFound();
        $report->file_path = '../../private-secret';
        $report->save();
        $this->get("/administration/rapports/$report->id/telecharger")->assertNotFound();
    }

    public function test_revoked_inactive_changed_account_and_missing_second_proof_cannot_read_or_write(): void
    {
        $user = $this->admin();
        $report = $this->createReport();
        $data = $this->data();
        $this->withSession(['two_factor_verified' => null]);
        $this->get("/administration/rapports/$report->id/telecharger")->assertRedirect('/connexion');
        foreach ([['is_admin' => false], ['is_active' => false], ['session_version' => 2]] as $change) {
            $user->forceFill(['is_admin' => true, 'is_active' => true, 'session_version' => 1])->save();
            $this->verifiedAdmin($user);
            User::whereKey($user->id)->update($change);
            $this->post('/administration/rapports', $data)->assertForbidden();
            $user->forceFill(['is_admin' => true, 'is_active' => true, 'session_version' => 1])->save();
            $this->verifiedAdmin($user);
            User::whereKey($user->id)->update($change);
            $this->get("/administration/rapports/$report->id/telecharger")->assertForbidden();
        }
        $user->forceFill(['is_admin' => true, 'is_active' => true, 'session_version' => 1])->save();
        $this->verifiedAdmin($user);
        $other = User::factory()->create(['is_admin' => true, 'is_active' => true, 'session_version' => 1]);
        $this->actingAs($other)->get('/administration/rapports')->assertRedirect('/connexion');
        $this->assertDatabaseCount('activity_reports', 1);
    }

    public function test_email_mode_proof_is_required_and_wrong_email_is_refused(): void
    {
        $user = $this->admin();
        config(['login.verification' => 'email']);
        $this->get('/administration/rapports')->assertRedirect('/connexion');
        $this->actingAs($user)->withSession(['admin_version' => 1, 'two_factor_verified' => ['id' => $user->id, 'version' => 1, 'method' => 'email', 'email' => hash('sha256', $user->email)]])->get('/administration/rapports')->assertOk();
        User::whereKey($user->id)->update(['email' => 'changed@example.test']);
        $this->get('/administration/rapports')->assertRedirect('/connexion');
    }

    public function test_csrf_plain_text_escaping_and_per_account_rate_limit(): void
    {
        $this->admin();
        $this->app->bind(PreventRequestForgery::class, fn ($app) => new class($app, $app['encrypter']) extends PreventRequestForgery
        {
            protected function runningUnitTests()
            {
                return false;
            }
        });
        $data = $this->data(['title' => '<script>alert(1)</script>']);
        $this->post('/administration/rapports', $data)->assertStatus(419);
        $this->withSession(['_token' => 'test-csrf']);
        $data['_token'] = 'test-csrf';
        $this->post('/administration/rapports', $data)->assertSessionHasNoErrors();
        $this->get('/administration/rapports')->assertSee('&lt;script&gt;alert(1)&lt;/script&gt;', false)->assertDontSee('<script>alert(1)</script>', false);
        for ($n = 0; $n < 5; $n++) {
            $this->post('/administration/rapports', ['_token' => 'test-csrf'])->assertStatus(302);
        }
        $this->withServerVariables(['REMOTE_ADDR' => '127.0.0.2'])->post('/administration/rapports', ['_token' => 'test-csrf'])->assertStatus(429);
    }

    public function test_failed_history_rolls_back_database_and_cleans_new_file(): void
    {
        $this->admin();
        $data = $this->data();
        DB::statement('CREATE TRIGGER report_revision_failure BEFORE INSERT ON activity_report_revisions BEGIN SELECT RAISE(ABORT, "test failure"); END');
        $this->post('/administration/rapports', $data)->assertStatus(500);
        $this->assertDatabaseCount('activity_reports', 0);
        $this->assertSame([], Storage::disk('reports')->allFiles());
    }

    public function test_quota_counts_old_files_once_even_after_text_edits_and_archiving(): void
    {
        $this->admin();
        $report = $this->createReport();
        config(['geca.reports_quota_bytes' => $report->bytes * 2]);
        $this->put("/administration/rapports/$report->id", ['title' => 'TEST corrigé', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31', 'revision' => 1])->assertSessionHasNoErrors();
        $this->put("/administration/rapports/$report->id", ['title' => 'TEST corrigé', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31', 'revision' => 2, 'document' => $this->pdf()])->assertSessionHasNoErrors();
        $this->delete("/administration/rapports/$report->id", ['revision' => 3, 'confirm' => 1])->assertSessionHasNoErrors();
        $this->post('/administration/rapports', $this->data())->assertSessionHasErrors('document');
        $this->assertCount(2, Storage::disk('reports')->allFiles());
    }

    public function test_dates_are_required_real_ordered_and_checked_without_browser_validation(): void
    {
        $this->admin();
        foreach ([
            ['start_date' => '', 'end_date' => '2025-12-31'],
            ['start_date' => '2025-01-01', 'end_date' => ''],
            ['start_date' => [], 'end_date' => '2025-12-31'],
            ['start_date' => '2025-01-01', 'end_date' => []],
            ['start_date' => '2025-02-29', 'end_date' => '2025-12-31'],
            ['start_date' => '2025-01-01', 'end_date' => '2025-04-31'],
            ['start_date' => '2025-13-01', 'end_date' => '2025-12-31'],
            ['start_date' => '01/01/2025', 'end_date' => '2025-12-31'],
            ['start_date' => '0000-01-01', 'end_date' => '2025-12-31'],
            ['start_date' => '2025-01-01', 'end_date' => '10000-01-01'],
            ['start_date' => '2025-12-31', 'end_date' => '2025-01-01'],
        ] as $dates) {
            $this->travel(61)->seconds();
            $this->post('/administration/rapports', $this->data($dates))->assertSessionHasErrors();
            $this->assertDatabaseCount('activity_reports', 0);
            $this->assertSame([], Storage::disk('reports')->allFiles());
        }
        $this->travel(61)->seconds();
        $this->post('/administration/rapports', $this->data(['start_date' => '2024-02-29', 'end_date' => '2024-02-29', 'period' => 'Valeur falsifiée']))->assertSessionHasNoErrors();
        $report = ActivityReport::firstOrFail();
        $this->assertSame('2024-02-29/2024-02-29', $report->period);
        $this->assertSame(['start_date' => '2024-02-29', 'end_date' => '2024-02-29'], $report->dateFields());
        $this->get('/administration/rapports')->assertSee('Du 29/02/2024 au 29/02/2024');
        $this->get("/administration/rapports/$report->id/modifier")->assertSee('value="2024-02-29"', false);
        $this->put("/administration/rapports/$report->id", ['title' => 'TEST', 'start_date' => '2025-12-31', 'end_date' => '2025-01-01', 'revision' => 1])->assertSessionHasErrors('end_date');
        $this->assertSame('2024-02-29/2024-02-29', $report->fresh()->period);
        $this->assertDatabaseCount('activity_report_revisions', 1);
    }

    public function test_legacy_periods_are_preserved_without_inventing_dates(): void
    {
        $this->admin();
        $report = $this->createReport();
        $report->period = 'Année de test, sans dates exactes fournies';
        $report->save();
        $this->assertSame([], $report->dateFields());
        $this->get("/administration/rapports/$report->id/modifier")->assertSee($report->period)->assertSee('name="start_date"', false)->assertSee('value=""', false);
        $this->put("/administration/rapports/$report->id", ['title' => 'TEST ancien formulaire', 'period' => '2025', 'revision' => 1])->assertSessionHasErrors(['start_date', 'end_date']);
        $this->assertSame($report->period, $report->fresh()->period);
        $this->put("/administration/rapports/$report->id", ['title' => 'TEST corrigé', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31', 'revision' => 1])->assertSessionHasNoErrors();
        $this->assertSame('2025-01-01/2025-12-31', $report->fresh()->period);
        foreach (['2025-02-30/2025-03-01', '2025-12-31/2025-01-01', '0000-01-01/2025-01-01', '2025', ''] as $value) {
            $report->period = $value;
            $this->assertSame([], $report->dateFields());
            $this->assertSame($value, $report->periodLabel());
        }
    }
}
