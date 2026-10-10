<?php

return [
    'public_site_url' => env('GECA_PUBLIC_SITE_URL', 'https://globalecoaction.org'),
    'media_uploads_enabled' => env('GECA_MEDIA_UPLOADS_ENABLED', false),
    // Dossier public de la vitrine, configuré au serveur uniquement.
    'reference_public_path' => env('GECA_REFERENCE_PUBLIC_PATH'),
    // Chemin absolu privé configuré sur l'hôte, jamais fourni par une requête.
    'public_path' => env('GECA_PUBLIC_PATH'),
];
