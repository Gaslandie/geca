<!doctype html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow,noarchive">
    <title>@yield('title', 'Espace de gestion') · Global EcoAction</title>
    <x-admin-styles />
    @auth
        @php
            $navigationNonce = base64_encode(random_bytes(18));
            request()->attributes->set('navigation_nonce', $navigationNonce);
        @endphp
        <script src="{{ asset('admin-navigation.js') }}?v={{ filemtime(public_path('admin-navigation.js')) }}" nonce="{{ $navigationNonce }}" defer></script>
    @endauth
    @stack('scripts')
</head>
<body class="@auth admin-shell @else guest-shell @endauth" data-admin-theme>
<a class="skip" href="#contenu">Aller au contenu</a>
@auth
    @php
        $activeSection = request()->routeIs('content.trash', 'content.trash-all') ? 'trash' : (request()->routeIs('security*') ? 'security' : (request()->routeIs('newsletter.*') ? 'newsletter' : (request()->routeIs('dashboard') ? 'dashboard' : request()->route('kind'))));
        $navigation = [
            ['key' => 'dashboard', 'label' => 'Accueil', 'icon' => 'home', 'url' => route('dashboard')],
            ['key' => 'projects', 'label' => 'Projets et programmes', 'icon' => 'projects', 'url' => route('content.index', 'projects')],
            ['key' => 'news', 'label' => 'Actualités', 'icon' => 'news', 'url' => route('content.index', 'news')],
            ['key' => 'newsletter', 'label' => 'Newsletter', 'icon' => 'newsletter', 'url' => route('newsletter.index')],
            ['key' => 'security', 'label' => 'Sécurité du compte', 'icon' => 'security', 'url' => route('security')],
            ['key' => 'team', 'label' => 'Équipe', 'icon' => 'team', 'url' => route('content.index', 'team')],
            ['key' => 'trash', 'label' => 'Corbeille', 'icon' => 'trash', 'url' => route('content.trash-all')],
        ];
        $sectionLabel = collect($navigation)->firstWhere('key', $activeSection)['label'] ?? 'Espace de gestion';
    @endphp
    <aside id="admin-sidebar" class="admin-sidebar" aria-label="Menu latéral">
        <a class="admin-brand" href="{{ route('dashboard') }}"><img src="{{ asset('brand/geca-logo-client-20261010-480.webp') }}" width="1600" height="666" alt="Global EcoAction — Tableau de bord"><span>Espace de gestion</span></a>
        @include('partials.admin-navigation')
    </aside>
    <div class="admin-workspace">
    <header class="admin-topbar">
        <div class="admin-topbar-controls">
        <button class="sidebar-toggle secondary" type="button" aria-controls="admin-sidebar" aria-expanded="true" aria-label="Fermer le menu latéral" title="Fermer le menu latéral" hidden><x-admin-icon name="sidebar" /></button>
        <nav class="admin-breadcrumb" aria-label="Votre emplacement"><a href="{{ route('dashboard') }}">Espace de gestion</a><span aria-hidden="true">/</span><span>{{ $sectionLabel }}</span></nav>
        </div>
        <div class="admin-account"><span class="admin-avatar" aria-hidden="true">{{ mb_strtoupper(mb_substr(auth()->user()->name, 0, 2)) }}</span><span>{{ auth()->user()->name }}</span></div>
    </header>
    <header class="mobile-header">
        <a class="admin-brand" href="{{ route('dashboard') }}"><img src="{{ asset('brand/geca-logo-client-20261010-480.webp') }}" width="1600" height="666" alt="Global EcoAction — Tableau de bord"></a>
        <button class="mobile-menu-trigger secondary" type="button" commandfor="admin-mobile-menu" command="show-modal" aria-haspopup="dialog" aria-controls="admin-mobile-menu"><x-admin-icon name="menu" /><span>Menu</span></button>
    </header>
    <dialog id="admin-mobile-menu" class="mobile-navigation" aria-label="Menu de l’administration">
        <div class="mobile-menu-heading">
            <img src="{{ asset('brand/geca-logo-client-20261010-480.webp') }}" width="1600" height="666" alt="Global EcoAction" class="mobile-menu-logo">
            <form method="dialog"><button class="mobile-menu-close secondary" type="submit" aria-label="Fermer le menu" title="Fermer le menu" autofocus><x-admin-icon name="close" /></button></form>
        </div>
        <div class="mobile-navigation-content">@include('partials.admin-navigation')</div>
    </dialog>
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
@auth</div>@endauth
</body>
</html>
