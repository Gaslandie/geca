@php
$en=$locale==='en';
$siteBase=preg_replace('~/(fr|en)$~','',rtrim(config('geca.public_site_url'),'/'));
$text=[
403=>[$en?'Request refused':'Demande refusée',$en?'This request or link cannot be accepted. Open the newsletter form to start again.':'Cette demande ou ce lien ne peut pas être accepté. Ouvrez le formulaire de newsletter pour recommencer.'],
404=>[$en?'Page not found':'Page introuvable',$en?'Use the newsletter form to continue.':'Utilisez le formulaire de newsletter pour continuer.'],
419=>[$en?'Please reopen the form':'Rouvrez le formulaire',$en?'This page is no longer valid. Reopen the newsletter form and try again. Your request has not been recorded.':'Cette page n’est plus valide. Rouvrez le formulaire de newsletter, puis réessayez. Votre demande n’a pas été enregistrée.'],
429=>[$en?'Too many requests':'Trop de demandes',$en?'Please try again later. Your latest request has not been recorded.':'Veuillez réessayer plus tard. Votre dernière demande n’a pas été enregistrée.'],
][$status];
@endphp
<!doctype html><html lang="{{ $locale }}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{{ $text[0] }} · Global EcoAction</title><x-admin-styles /></head>
<body class="guest-shell"><header class="topbar"><a class="brand" href="{{ $siteBase }}/{{ $locale }}">Global EcoAction</a></header><main id="contenu"><section class="card login"><h1>{{ $text[0] }}</h1><p>{{ $text[1] }}</p><p><a href="{{ route('newsletter.form',$locale) }}">{{ $en?'Back to the newsletter form':'Retour au formulaire de newsletter' }}</a></p><p><a href="{{ $siteBase }}/{{ $locale }}">{{ $en?'Back to the site':'Retour au site' }}</a></p></section></main><footer>Global EcoAction</footer></body></html>
