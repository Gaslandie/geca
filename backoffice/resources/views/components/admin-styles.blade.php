{{-- Deux fichiers locaux communs : thème visuel, puis structure des composants. --}}
@foreach(['admin-theme.css', 'admin.css'] as $stylesheet)
<link rel="stylesheet" href="{{ asset($stylesheet) }}?v={{ filemtime(public_path($stylesheet)) }}">
@endforeach
