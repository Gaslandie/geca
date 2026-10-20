<?php

namespace App\Http\Controllers;

use App\Mail\PublicContactMessage;
use App\Support\OrganizationEmail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Throwable;

class PublicContactController extends Controller
{
    public function token(Request $request): JsonResponse
    {
        $token = Str::random(64);
        Cache::put($this->proofKey($request), [
            'token' => hash('sha256', $token),
            'origin' => $request->header('Origin'),
            'ip' => hash('sha256', $request->ip() ?? ''),
            'issued' => now()->timestamp,
        ], now()->addMinutes(30));

        return response()->json(['token' => $token]);
    }

    private function proofKey(Request $request): string
    {
        return 'public-contact:'.hash('sha256', $request->header('Origin').'|'.($request->ip() ?? ''));
    }

    public function send(Request $request): JsonResponse
    {
        abort_unless($request->isJson() && strlen($request->getContent()) <= 16384, 415);
        $data = $request->validate([
            'token' => ['required', 'string', 'size:64', 'alpha_num:ascii'],
            'name' => ['required', 'string', 'min:2', 'max:100', 'not_regex:/[\r\n\x00]/'],
            'email' => ['required', 'string', 'email:rfc', 'max:254', 'not_regex:/[\r\n\x00]/'],
            'organization' => ['nullable', 'string', 'max:160'],
            'reason' => ['required', 'in:partnership,project,other'],
            'message' => ['required', 'string', 'min:10', 'max:3000'],
            'website' => ['nullable', 'string', 'max:0'],
        ]);
        $key = $this->proofKey($request);
        $proof = Cache::lock($key.':lock', 10)->get(function () use ($key, $data) {
            $proof = Cache::get($key);
            if (! is_array($proof) || ! hash_equals($proof['token'], hash('sha256', $data['token']))) {
                return null;
            }
            Cache::forget($key);

            return $proof;
        });
        abort_unless(is_array($proof) && $proof['origin'] === $request->header('Origin') && $proof['ip'] === hash('sha256', $request->ip() ?? '') && now()->timestamp - $proof['issued'] >= 2, 419);
        try {
            // Le transport par défaut reste une simulation pour les autres modules.
            // Le contact utilise explicitement le SMTP transactionnel de connexion.
            $mailer = config('login.mailer');
            $settings = is_string($mailer) ? config('mail.mailers.'.$mailer) : null;
            $from = config('login.from');
            if (! is_array($settings) || ($settings['transport'] ?? null) !== 'smtp'
                || ($settings['require_tls'] ?? null) !== true
                || ! in_array($settings['scheme'] ?? null, ['smtp', 'smtps'], true)
                || empty($settings['host']) || empty($settings['username']) || empty($settings['password'])
                || ! is_string($from) || ! filter_var($from, FILTER_VALIDATE_EMAIL)) {
                throw new \RuntimeException('Messagerie de contact indisponible.');
            }
            $sent = Mail::mailer($mailer)->to(OrganizationEmail::CONTACT_RECIPIENT)
                ->send((new PublicContactMessage($data))->from($from, 'Global EcoAction'));
            if ($sent === null) {
                throw new \RuntimeException('Message non transmis.');
            }
        } catch (Throwable) {
            // Aucune saisie personnelle ni erreur SMTP exposée ou journalisée ici.
            return response()->json(['error' => 'delivery'], 503);
        }

        return response()->json(['sent' => true]);
    }
}
