<nav class="admin-navigation" aria-label="Navigation de l’administration">
    <ul>
        @foreach($navigation as $item)
            <li><a href="{{ $item['url'] }}" @if($activeSection === $item['key']) aria-current="page" @endif>
                <x-admin-icon :name="$item['icon']" /><span>{{ $item['label'] }}</span>
            </a></li>
        @endforeach
    </ul>
</nav>
<div class="sidebar-bottom">
    <a class="sidebar-action" href="{{ config('geca.public_site_url') }}" target="_blank" rel="noopener noreferrer">
        <x-admin-icon name="external" /><span>Voir le site<span class="visually-hidden"> (nouvel onglet)</span></span>
    </a>
    <form method="post" action="{{ route('logout') }}">@csrf<button class="sidebar-action" type="submit"><x-admin-icon name="logout" /><span>Se déconnecter</span></button></form>
    <p class="sidebar-footer">Global EcoAction · Espace privé</p>
</div>
