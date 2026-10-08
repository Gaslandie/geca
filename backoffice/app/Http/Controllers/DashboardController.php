<?php

namespace App\Http\Controllers;

use App\Models\ContentEntry;

class DashboardController extends Controller
{
    public function __invoke()
    {
        // Les données ne sont chargées qu'après les contrôles auth/admin de la route.
        $counts = array_fill_keys(['projects', 'news', 'team'], 0);
        foreach (ContentEntry::whereIn('kind', array_keys($counts))
            ->selectRaw('kind, COUNT(*) AS total')->groupBy('kind')->get() as $row) {
            $counts[$row->kind] = (int) $row->total;
        }

        return view('dashboard', ['counts' => $counts]);
    }
}
