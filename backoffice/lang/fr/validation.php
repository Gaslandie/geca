<?php

return [
    'required' => 'Le champ :attribute est obligatoire.',
    'required_with' => 'Décrivez la photo en quelques mots avant de l’enregistrer.',
    'email' => 'Saisissez une adresse e-mail valide.',
    'string' => 'Le champ :attribute doit contenir du texte.',
    'array' => 'Les champs transmis pour :attribute ne sont pas valides.',
    'integer' => 'Le champ :attribute doit être un nombre entier.',
    'boolean' => 'Choisissez une réponse pour :attribute.',
    'file' => 'Choisissez un fichier pour :attribute.',
    'uploaded' => 'Le fichier n’a pas pu être envoyé. Réessayez avec un fichier plus petit.',
    'min' => ['string' => 'Le champ :attribute doit contenir au moins :min caractères.', 'numeric' => 'Le champ :attribute doit être au moins :min.'],
    'max' => ['string' => 'Le champ :attribute ne doit pas dépasser :max caractères.', 'numeric' => 'Le champ :attribute ne doit pas dépasser :max.', 'file' => 'La photo doit peser au maximum 6 Mo.'],
    'attributes' => [
        'email' => 'adresse e-mail', 'password' => 'mot de passe',
        'source_note' => 'raison du changement', 'revision' => 'version du texte',
        'photo' => 'photo', 'title' => 'nom de la photo', 'source' => 'origine de la photo',
        'credit' => 'photographe', 'license' => 'autorisation d’utiliser la photo',
        'alt_fr' => 'description de la photo en français', 'alt_en' => 'description de la photo en anglais',
        'illustrative' => 'lien entre la photo et l’activité',
    ],
];
