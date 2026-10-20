<?php

namespace App\Support;

final class OrganizationEmail
{
    // Adresse de réception GECA ; distincte du compte SMTP autorisé à expédier.
    public const ADDRESS = 'ong.geca@gmail.com';

    // Test de réception demandé par Gassama le 20 octobre 2026.
    // À rétablir sur ADDRESS après sa confirmation.
    public const CONTACT_RECIPIENT = 'gassma803@gmail.com';
}
