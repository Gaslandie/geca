<?php

return [
    'mode' => env('GECA_NEWSLETTER_MODE', 'preview'),
    'public_url' => env('APP_URL', 'http://127.0.0.1:8000'),
    'origins' => array_filter(explode(',', env('GECA_NEWSLETTER_ORIGINS', 'http://127.0.0.1:3000,http://127.0.0.1:8000'))),
    'from' => env('GECA_NEWSLETTER_FROM', ''),
    'hourly_limit' => (int) env('GECA_NEWSLETTER_HOURLY_LIMIT', 30),
];
