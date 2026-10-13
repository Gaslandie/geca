<?php

namespace App\Http\Controllers;

use App\Models\ActivityReport;
use App\Services\BackofficeAuthorization;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ActivityReportController extends Controller
{
    public function index()
    {
        return $this->listing(false);
    }

    public function archives()
    {
        return $this->listing(true);
    }

    private function listing(bool $archived)
    {
        // Les administrateurs actifs gèrent les mêmes rapports de l'unique ONG.
        $query = $archived ? ActivityReport::onlyTrashed() : ActivityReport::query();

        return view('reports.index', ['reports' => $query->orderByDesc('created_at')->orderBy('id')->paginate(20), 'archived' => $archived]);
    }

    public function create(Request $request)
    {
        $token = (string) Str::uuid();
        $pending = collect($request->session()->get('report_creation', []))
            ->filter(fn ($item) => ($item['expires'] ?? 0) > time())->take(-9)->all();
        $pending[$token] = ['user' => $request->user()->id, 'expires' => time() + 3600];
        $request->session()->put('report_creation', $pending);

        return view('reports.edit', ['report' => new ActivityReport, 'creationToken' => $token]);
    }

    public function edit(string $report)
    {
        return view('reports.edit', ['report' => ActivityReport::findOrFail($report)]);
    }

    public function store(Request $request)
    {
        $request->validate(['creation_token' => ['required', 'uuid']]);
        $token = $request->input('creation_token');
        $pending = $request->session()->get('report_creation', []);
        $permission = $pending[$token] ?? null;
        if (! is_array($permission) || ($permission['user'] ?? null) !== $request->user()->id || ($permission['expires'] ?? 0) <= time()) {
            throw ValidationException::withMessages(['creation_token' => 'Ce formulaire a expiré ou a déjà été utilisé. Rouvrez la page Ajouter un rapport.']);
        }
        $response = $this->save($request);
        unset($pending[$token]);
        $request->session()->put('report_creation', $pending);

        return $response;
    }

    public function update(Request $request, string $report)
    {
        ActivityReport::findOrFail($report);

        return $this->save($request, $report);
    }

    private function save(Request $request, ?string $id = null)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'start_date' => ['bail', 'required', 'string', 'date_format:Y-m-d', 'after_or_equal:0001-01-01', 'before_or_equal:9999-12-31'],
            'end_date' => ['bail', 'required', 'string', 'date_format:Y-m-d', 'after_or_equal:0001-01-01', 'before_or_equal:9999-12-31'],
            'description' => ['nullable', 'string', 'max:5000'],
            'revision' => $id ? ['required', 'integer', 'min:1'] : ['prohibited'],
            'document' => [$id ? 'nullable' : 'required', 'file', 'mimetypes:application/pdf', 'extensions:pdf', 'max:10240'],
        ], [
            'required' => 'Le champ :attribute est obligatoire.',
            'string' => 'Le champ :attribute doit contenir du texte.',
            'max' => 'Le champ :attribute dépasse la limite autorisée.',
            'date_format' => 'Choisissez une date valide pour le champ :attribute.',
            'start_date.after_or_equal' => 'Choisissez une date de début valide.',
            'start_date.before_or_equal' => 'Choisissez une date de début valide.',
            'end_date.after_or_equal' => 'Choisissez une date de fin valide.',
            'end_date.before_or_equal' => 'Choisissez une date de fin valide.',
            'document.mimetypes' => 'Choisissez un fichier PDF.',
            'document.extensions' => 'Le fichier doit porter l’extension .pdf.',
            'document.max' => 'Le PDF ne doit pas dépasser 10 Mo.',
            'document.file' => 'Le fichier n’a pas pu être reçu. Choisissez-le à nouveau.',
        ], ['title' => 'titre', 'start_date' => 'date de début', 'end_date' => 'date de fin', 'description' => 'description', 'document' => 'fichier PDF']);
        // Comparer seulement après validation des deux chaînes ISO : une requête
        // directe peut envoyer un tableau à la place d'une date.
        if ($data['end_date'] < $data['start_date']) {
            throw ValidationException::withMessages(['end_date' => 'La date de fin doit être le même jour que la date de début ou venir après.']);
        }
        $contents = null;
        if ($request->hasFile('document')) {
            $contents = $request->file('document')->get();
            // Contrôles de format complémentaires ; ne constituent pas un antivirus.
            if (! preg_match('/\A%PDF-(?:1\.[0-7]|2\.0)\b/', $contents)
                || ! preg_match('/%%EOF\s*\z/', substr($contents, -1024))
                || stripos($contents, '<?php') !== false) {
                throw ValidationException::withMessages(['document' => 'Le fichier ne ressemble pas à un PDF complet. Exportez à nouveau votre rapport en PDF.']);
            }
        }
        $newPath = null;
        try {
            $report = $this->locked(function () use ($request, $data, $contents, $id, &$newPath) {
                $this->actor($request);
                $report = $id ? ActivityReport::whereKey($id)->lockForUpdate()->firstOrFail() : new ActivityReport;
                if ($id) {
                    $this->checkRevision($report, $data['revision']);
                    $report->revision++;
                } else {
                    $report->id = (string) Str::uuid();
                    $report->created_by = $request->user()->id;
                    $report->revision = 1;
                }
                if ($contents !== null) {
                    // Le quota compte une seule fois chaque fichier, anciennes versions incluses.
                    $used = DB::table('activity_report_revisions')->get(['payload'])
                        ->map(fn ($row) => json_decode($row->payload, true, flags: JSON_THROW_ON_ERROR))
                        ->unique('file_path')->sum('bytes');
                    if ($used + strlen($contents) > config('geca.reports_quota_bytes')) {
                        throw ValidationException::withMessages(['document' => 'Le stockage des rapports est plein. Contactez la personne qui gère l’hébergement.']);
                    }
                    $newPath = $report->id.'/'.Str::uuid().'.pdf';
                    Storage::disk('reports')->put($newPath, $contents);
                    $report->file_path = $newPath;
                    $report->bytes = strlen($contents);
                    $report->sha256 = hash('sha256', $contents);
                }
                $report->title = $data['title'];
                // Deux dates exactes dans le champ existant ; aucune conversion des anciennes périodes.
                $report->period = $data['start_date'].'/'.$data['end_date'];
                $report->description = $data['description'] ?? null;
                $report->save();
                $this->revision($report, $request->user()->id, $id ? 'update' : 'create');

                return $report;
            });
        } catch (\Throwable $error) {
            if ($newPath !== null) {
                Storage::disk('reports')->delete($newPath);
            }
            throw $error;
        }

        return redirect()->route('reports.edit', $report)->with('status', 'Rapport enregistré dans l’espace privé.');
    }

    private function locked(callable $operation)
    {
        try {
            return Cache::lock('activity-reports-write', 120)->block(10, fn () => DB::transaction($operation));
        } catch (LockTimeoutException) {
            throw ValidationException::withMessages(['document' => 'Un autre rapport est en cours d’enregistrement. Réessayez dans quelques instants.']);
        }
    }

    private function actor(Request $request): void
    {
        app(BackofficeAuthorization::class)->writer($request);
    }

    private function checkRevision(ActivityReport $report, mixed $revision): void
    {
        if ($report->revision !== (int) $revision) {
            throw ValidationException::withMessages(['revision' => 'Ce rapport a changé. Copiez vos corrections, puis rouvrez sa page avant de réessayer.']);
        }
    }

    private function revision(ActivityReport $report, int $actor, string $action): void
    {
        DB::table('activity_report_revisions')->insert([
            'activity_report_id' => $report->id, 'user_id' => $actor, 'revision' => $report->revision,
            'action' => $action, 'payload' => json_encode($report->only(['title', 'period', 'description', 'file_path', 'bytes', 'sha256', 'created_by', 'deleted_at']), JSON_THROW_ON_ERROR),
            'created_at' => now(),
        ]);
    }

    public function download(string $report)
    {
        $record = ActivityReport::findOrFail($report);
        // Chemin issu de la base et limité à ce rapport, jamais issu de la requête.
        abort_unless(preg_match('/\A'.preg_quote($record->id, '/').'\/[a-f0-9-]{36}\.pdf\z/', $record->file_path), 404);
        $disk = Storage::disk('reports');
        abort_unless($disk->exists($record->file_path), 404);

        return $disk->download($record->file_path, 'rapport-'.$record->id.'.pdf', ['Content-Type' => 'application/pdf']);
    }

    public function destroy(Request $request, string $report)
    {
        $data = $request->validate(['revision' => ['required', 'integer', 'min:1'], 'confirm' => ['accepted']], ['confirm.accepted' => 'Cochez la confirmation avant de retirer ce rapport.']);
        $this->locked(function () use ($request, $report, $data) {
            $this->actor($request);
            $record = ActivityReport::whereKey($report)->lockForUpdate()->firstOrFail();
            $this->checkRevision($record, $data['revision']);
            $record->revision++;
            $record->save();
            $record->delete();
            $this->revision($record, $request->user()->id, 'archive');
        });

        return redirect()->route('reports.index')->with('status', 'Rapport retiré de la liste. Vous pouvez le retrouver dans les rapports retirés.');
    }

    public function restore(Request $request, string $report)
    {
        $data = $request->validate(['revision' => ['required', 'integer', 'min:1']]);
        $this->locked(function () use ($request, $report, $data) {
            $this->actor($request);
            $record = ActivityReport::onlyTrashed()->whereKey($report)->lockForUpdate()->firstOrFail();
            $this->checkRevision($record, $data['revision']);
            $record->revision++;
            $record->restore();
            $this->revision($record, $request->user()->id, 'restore');
        });

        return redirect()->route('reports.index')->with('status', 'Rapport restauré.');
    }
}
