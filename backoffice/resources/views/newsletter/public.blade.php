@php
$en=$locale==='en';
$siteBase=preg_replace('~/(fr|en)$~','',rtrim(config('geca.public_site_url'),'/'));
$siteHome=$siteBase.'/'.$locale;
$text=[
'signup'=>[$en?'Subscribe to our newsletter':'Abonnez-vous à notre newsletter',$en?'Confirm your request below. Your address becomes active only after email confirmation.':'Confirmez votre demande ci-dessous. Votre adresse sera active seulement après confirmation par e-mail.'],
'requested'=>[$en?'Request received':'Demande reçue',$en?'If your address can be registered, you will receive a confirmation email. No action is needed if you are already subscribed.':'Si votre adresse peut être inscrite, vous recevrez un e-mail de confirmation. Aucune action n’est nécessaire si vous êtes déjà abonné.'],
 'test-requested'=>[$en?'Test request received':'Demande de test reçue',$en?'Local test: no real email is sent. The confirmation message can be checked in the private administration.':'Test local : aucun e-mail réel n’est envoyé. Le message de confirmation peut être vérifié dans l’administration privée.'],
'confirm'=>[$en?'Confirm your subscription':'Confirmez votre inscription',$en?'Use the button to confirm that you want to receive the Global EcoAction newsletter.':'Utilisez le bouton pour confirmer que vous souhaitez recevoir la newsletter Global EcoAction.'],
'confirmed'=>[$en?'Subscription confirmed':'Inscription confirmée',$en?'Your newsletter subscription is confirmed.':'Votre inscription à la newsletter est confirmée.'],
'unsubscribe'=>[$en?'Unsubscribe':'Se désinscrire',$en?'Use the button to stop receiving the Global EcoAction newsletter.':'Utilisez le bouton pour ne plus recevoir la newsletter Global EcoAction.'],
'unsubscribed'=>[$en?'Unsubscribed':'Désinscription enregistrée',$en?'You will no longer receive the newsletter. Messages already handed to the mail server cannot be recalled.':'Vous ne recevrez plus la newsletter. Les messages déjà remis au serveur de messagerie ne peuvent pas être rappelés.'],
][$stage];
@endphp
<!doctype html><html lang="{{ $locale }}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{{ $text[0] }} · Global EcoAction</title><x-admin-styles /></head>
<body class="guest-shell"><header class="topbar"><a class="brand" href="{{ $siteHome }}">Global EcoAction</a></header><main id="contenu"><section class="card login"><h1>{{ $text[0] }}</h1><p role="status">{{ $text[1] }}</p>
@if($errors->any())
<div class="errors" role="alert" tabindex="-1" autofocus aria-labelledby="newsletter-errors-title">
<h2 id="newsletter-errors-title">{{ $en?'Check the following fields':'Vérifiez les champs suivants' }}</h2>
<ul>
@foreach(['email','consent'] as $field)
@if($errors->has($field))<li><a href="#{{ $field }}">{{ $errors->first($field) }}</a></li>@endif
@endforeach
@if($errors->has('website'))<li>{{ $errors->first('website') }}</li>@endif
</ul></div>
@endif
@if($stage==='signup')
@if(config('newsletter.mode')==='preview')<p class="notice">{{ $en?'Test mode: no real email will be sent.':'Mode test : aucun e-mail réel ne sera envoyé.' }}</p>@endif
<form method="post" action="{{ route('newsletter.subscribe',$locale) }}" novalidate>@csrf
<label for="email">{{ $en?'Email address':'Adresse e-mail' }}</label><input id="email" name="email" type="email" maxlength="254" autocomplete="email" autocapitalize="none" spellcheck="false" required value="{{ $email ?? '' }}" @if($errors->has('email')) aria-invalid="true" aria-describedby="email-error" @endif>
@error('email')<p id="email-error" class="field-error">{{ $message }}</p>@enderror
<label class="consent"><input id="consent" type="checkbox" name="consent" value="1" required @checked(old('consent')==='1') @if($errors->has('consent')) aria-invalid="true" aria-describedby="consent-error" @endif><span>{{ $en?'I agree to receive the Global EcoAction newsletter. I can unsubscribe using the link in each message.':'J’accepte de recevoir la newsletter Global EcoAction. Je peux me désinscrire par le lien de chaque message.' }}</span></label>
@error('consent')<p id="consent-error" class="field-error">{{ $message }}</p>@enderror
<p>{{ $en?'Your email address, subscription status and consent dates are kept privately by GECA. Unconfirmed requests are removed after seven days.':'Votre adresse, l’état de votre inscription et les dates de votre accord sont conservés en privé par GECA. Les demandes non confirmées sont supprimées après sept jours.' }}</p>
<p><a href="{{ $siteBase }}/{{ $locale }}/confidentialite">{{ $en?'Privacy policy':'Politique de confidentialité' }}</a></p>
<div class="honeypot" aria-hidden="true"><label for="website">Website</label><input id="website" name="website" tabindex="-1" autocomplete="off"></div>
<button type="submit">{{ $en?'Subscribe':'S’abonner' }}</button></form>
@elseif(in_array($stage,['confirm','unsubscribe']))
<form method="post" action="{{ request()->getRequestUri() }}">@csrf<button type="submit">{{ $stage==='confirm'?($en?'Confirm my subscription':'Confirmer mon inscription'):($en?'Unsubscribe':'Me désinscrire') }}</button></form>
@endif
<p class="muted"><a href="{{ $siteHome }}">{{ $en?'Back to the site':'Retour au site' }}</a></p>
</section></main><footer>Global EcoAction</footer></body></html>
