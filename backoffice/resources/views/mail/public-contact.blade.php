Message envoyé depuis le formulaire de contact de Global EcoAction.

Nom : {!! $contact['name'] !!}
E-mail : {!! $contact['email'] !!}
Organisation : {!! $contact['organization'] ?? '' !!}
Sujet : {!! ['partnership' => 'Partenariat', 'project' => 'Projet', 'other' => 'Question / contact'][$contact['reason']] !!}

{!! $contact['message'] !!}
