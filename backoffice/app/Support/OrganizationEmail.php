<?php

namespace App\Support;

final class OrganizationEmail
{
    // Adresse de réception GECA ; distincte du compte SMTP autorisé à expédier.
    public const ADDRESS = 'ong.geca@gmail.com';

    public const CONTACT_RECIPIENT = self::ADDRESS;
}
