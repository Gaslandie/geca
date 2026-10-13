<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ActivityReport extends Model
{
    use SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected function casts(): array
    {
        return ['bytes' => 'integer', 'revision' => 'integer'];
    }

    public function dateFields(): array
    {
        if (! is_string($this->period) || ! preg_match('/\A([0-9]{4}-[0-9]{2}-[0-9]{2})\/([0-9]{4}-[0-9]{2}-[0-9]{2})\z/', $this->period, $matches)) {
            return [];
        }
        foreach ([$matches[1], $matches[2]] as $value) {
            $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $value);
            if (! $date || $date->format('Y-m-d') !== $value || $value < '0001-01-01') {
                return [];
            }
        }
        if ($matches[2] < $matches[1]) {
            return [];
        }

        return ['start_date' => $matches[1], 'end_date' => $matches[2]];
    }

    public function periodLabel(): string
    {
        $dates = $this->dateFields();
        if (! $dates) {
            return $this->period ?? '';
        }

        return 'Du '.\DateTimeImmutable::createFromFormat('!Y-m-d', $dates['start_date'])->format('d/m/Y')
            .' au '.\DateTimeImmutable::createFromFormat('!Y-m-d', $dates['end_date'])->format('d/m/Y');
    }
}
