<?php

namespace App\Http\Controllers;

use App\Services\PublicPublication;
use Illuminate\Http\Request;

class PublicationController extends Controller
{
    public function index(Request $request, PublicPublication $publication)
    {
        abort_unless($request->user()->managesAccounts(), 403);
        $candidate = $publication->candidate();

        return view('publication.index', ['state' => $publication->locked(fn () => $publication->state()), 'candidate' => $candidate, 'fingerprint' => $publication->fingerprint($candidate), 'enabled' => $publication->enabled()]);
    }

    public function store(Request $request, PublicPublication $publication)
    {
        abort_unless($request->user()->managesAccounts(), 403);
        $publication->request($request);

        return redirect()->route('publication.index')->with('status', 'Publication demandée. Cette page indiquera quand la version sera en ligne.');
    }
}
