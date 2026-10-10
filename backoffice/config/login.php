<?php

return [
    // La bascule vers email exige une livraison SMTP réelle vérifiée.
    'verification' => env('GECA_LOGIN_VERIFICATION', 'email'),
    'mailer' => 'login',
    'from' => env('GECA_LOGIN_MAIL_FROM', env('MAIL_FROM_ADDRESS')),
    'local_user' => (int) env('GECA_LOCAL_ACCESS_USER', 0),
    'local_until' => (int) env('GECA_LOCAL_ACCESS_UNTIL', 0),
];
