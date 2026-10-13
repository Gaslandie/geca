<?php

namespace App\Enums;

enum BackofficeRole: string
{
    case Admin = 'admin';
    case Editor = 'editor';
    case Reader = 'reader';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrateur', self::Editor => 'Éditeur', self::Reader => 'Lecteur',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Admin => 'Gère les comptes et toutes les rubriques du back-office.',
            self::Editor => 'Ajoute et modifie les contenus et les rapports. Ne gère pas les comptes ni la newsletter.',
            self::Reader => 'Consulte les contenus et télécharge les rapports. Ne peut pas les modifier.',
        };
    }
}
