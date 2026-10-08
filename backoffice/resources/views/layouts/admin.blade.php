<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow,noarchive">
    <title>@yield('title', 'Espace de gestion') · Global EcoAction</title>
    <link rel="stylesheet" href="{{ asset('admin.css') }}">
</head>
<body class="@auth admin-shell @else guest-shell @endauth">
<a class="skip" href="#contenu">Aller au contenu</a>
@auth
    @php
        $activeSection = request()->routeIs('security*') ? 'security' : (request()->routeIs('newsletter.*') ? 'newsletter' : (request()->routeIs('dashboard') ? 'dashboard' : request()->route('kind')));
        $navigation = [
            ['key' => 'dashboard', 'label' => 'Accueil', 'icon' => 'home', 'url' => route('dashboard')],
            ['key' => 'projects', 'label' => 'Projets et programmes', 'icon' => 'projects', 'url' => route('content.index', 'projects')],
            ['key' => 'news', 'label' => 'Actualités', 'icon' => 'news', 'url' => route('content.index', 'news')],
            ['key' => 'newsletter', 'label' => 'Newsletter', 'icon' => 'news', 'url' => route('newsletter.index')],
            ['key' => 'security', 'label' => 'Sécurité du compte', 'icon' => 'team', 'url' => route('security')],
            ['key' => 'team', 'label' => 'Équipe', 'icon' => 'team', 'url' => route('content.index', 'team')],
        ];
        $sectionLabel = collect($navigation)->firstWhere('key', $activeSection)['label'] ?? 'Espace de gestion';
    @endphp
    <aside class="admin-sidebar" aria-label="Menu latéral">
        <a class="admin-brand" href="{{ route('dashboard') }}"><img src="{{ asset('brand/geca-logo.webp') }}" width="240" height="120" alt="Global EcoAction — Tableau de bord"><span>Espace de gestion</span></a>
        @include('partials.admin-navigation')
    </aside>
    <div class="admin-workspace">
    <header class="admin-topbar">
        <nav class="admin-breadcrumb" aria-label="Votre emplacement"><a href="{{ route('dashboard') }}">Espace de gestion</a><span aria-hidden="true">/</span><span>{{ $sectionLabel }}</span></nav>
        <div class="admin-account"><span class="admin-avatar" aria-hidden="true">{{ mb_strtoupper(mb_substr(auth()->user()->name, 0, 2)) }}</span><span>{{ auth()->user()->name }}</span></div>
    </header>
    <header class="mobile-header">
        <a class="admin-brand" href="{{ route('dashboard') }}"><img src="{{ asset('brand/geca-logo.webp') }}" width="240" height="120" alt="Global EcoAction — Tableau de bord"></a>
        <details class="mobile-navigation">
            <summary><x-admin-icon name="menu" /><span>Menu</span></summary>
            <div class="mobile-navigation-content">@include('partials.admin-navigation')</div>
        </details>
    </header>
@else
    <header class="topbar"><a class="brand" href="{{ route('login') }}">Global EcoAction <span>Espace de gestion</span></a></header>
@endauth
<main id="contenu" tabindex="-1">
    @if(session('status'))<p class="notice" role="status">{{ session('status') }}</p>@endif
    @if($errors->any() && !View::hasSection('inline-errors'))
        <div class="errors" role="alert" tabindex="-1">
            <p>Veuillez vérifier les informations saisies.</p>
            <ul>@foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul>
        </div>
    @endif
    @yield('content')
</main>
<footer>Global EcoAction · Espace privé</footer>
@auth</div>@endauth
</body>
</html>
