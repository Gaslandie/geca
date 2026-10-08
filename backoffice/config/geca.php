<?php

return [
    'public_site_url' => env('GECA_PUBLIC_SITE_URL', 'https://globalecoaction.org'),
    'media_uploads_enabled' => env('GECA_MEDIA_UPLOADS_ENABLED', false),
    // Chemin absolu privé configuré sur l'hôte, jamais fourni par une requête.
    'public_path' => env('GECA_PUBLIC_PATH'),
];
