<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\TwoFactor;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TwoFactorController extends Controller
{
    public function __construct(private TwoFactor $factor) {}

    private function stage(Request $request): string
    {
        return $request->session()->get('two_factor_pending.stage');
    }

    public function show(Request $request)
    {
        if ($this->stage($request) === 'recovery') {
            return redirect()->route('two-factor.recovery');
        }

        return view('auth.two-factor', [
            'setup' => $this->stage($request) === 'setup',
            'secret' => $this->stage($request) === 'setup' ? $this->factor->setupSecret($request) : null,
        ]);
    }

    public function qr(Request $request)
    {
        abort_unless($this->stage($request) === 'setup', 404);
        $user = $this->factor->pending($request);
        $uri = $this->factor->otp($this->factor->setupSecret($request), $user)->getProvisioningUri();
        $writer = new Writer(new ImageRenderer(new RendererStyle(240, 4), new SvgImageBackEnd));

        return response($writer->writeString($uri))->header('Content-Type', 'image/svg+xml');
    }

    public function verify(Request $request)
    {
        abort_unless(in_array($this->stage($request), ['setup', 'challenge'], true), 403);
        $data = $request->validate([
            'code' => ['nullable', 'string', 'regex:/\A[0-9]{6}\z/D', 'required_without:recovery_code', 'prohibits:recovery_code'],
            'recovery_code' => ['nullable', 'string', 'max:35', 'required_without:code', 'prohibits:code'],
        ]);
        $setup = $this->stage($request) === 'setup';
        [$user, $codes] = DB::transaction(function () use ($request, $data, $setup) {
            $user = User::whereKey($request->session()->get('two_factor_pending.id'))->lockForUpdate()->first();
            abort_unless($this->factor->pending($request, $user), 403);
            if ($setup) {
                $secret = $this->factor->setupSecret($request);
                if (! $this->factor->consume($user, $data['code'] ?? '', $secret)) {
                    $this->factor->reject();
                }
                $user->two_factor_secret = $secret;
                $user->two_factor_confirmed_at = now();
                $user->session_version++;
                $codes = $this->factor->newRecoveryCodes($user);
                DB::table('sessions')->where('user_id', $user->id)->delete();
            } else {
                $valid = ! empty($data['code'])
                    ? $this->factor->consume($user, $data['code'])
                    : $this->factor->consumeRecovery($user, $data['recovery_code'] ?? '');
                if (! $valid) {
                    $this->factor->reject(! empty($data['code']) ? 'code' : 'recovery_code');
                }
                $codes = null;
            }
            $user->save();

            return [$user, $codes];
        }, 3);
        if ($setup) {
            $request->session()->forget('two_factor_setup_secret');
            $request->session()->regenerate();
            $request->session()->put('two_factor_pending.version', $user->session_version);
            $request->session()->put('two_factor_pending.stage', 'recovery');
            $request->session()->put('two_factor_recovery_display', Crypt::encryptString(json_encode($codes, JSON_THROW_ON_ERROR)));

            return redirect()->route('two-factor.recovery');
        }
        $this->factor->login($request, $user);

        return redirect()->route('dashboard');
    }

    public function recovery(Request $request)
    {
        abort_unless($this->stage($request) === 'recovery', 403);
        $encrypted = $request->session()->pull('two_factor_recovery_display');
        $codes = $encrypted ? json_decode(Crypt::decryptString($encrypted), true, flags: JSON_THROW_ON_ERROR) : [];

        return view('auth.recovery-codes', compact('codes'));
    }

    public function finish(Request $request)
    {
        abort_unless($this->stage($request) === 'recovery', 403);
        $request->validate(['saved' => ['accepted']]);
        DB::transaction(function () use ($request) {
            $user = User::whereKey($request->session()->get('two_factor_pending.id'))->lockForUpdate()->first();
            abort_unless($this->factor->pending($request, $user), 403);
            $this->factor->login($request, $user);
        }, 3);

        return redirect()->route('dashboard');
    }

    public function cancel(Request $request)
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    public function settings(Request $request)
    {
        return view('auth.security', ['remaining' => count($request->user()->two_factor_recovery_hashes ?? [])]);
    }

    public function regenerate(Request $request)
    {
        $data = $request->validate(['password' => ['required', 'string', 'max:256'], 'code' => ['required', 'string', 'max:35']]);
        [$user, $codes] = DB::transaction(function () use ($request, $data) {
            $user = User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            abort_unless($user->is_admin && $user->is_active && $user->session_version === $request->session()->get('admin_version'), 403);
            if (! Hash::check($data['password'], $user->password)) {
                $this->factor->reject();
            }
            if (! $this->factor->consume($user, $data['code']) && ! $this->factor->consumeRecovery($user, $data['code'])) {
                $this->factor->reject();
            }
            $codes = $this->factor->newRecoveryCodes($user);
            $user->session_version++;
            $user->save();
            DB::table('sessions')->where('user_id', $user->id)->delete();

            return [$user, $codes];
        }, 3);
        $this->factor->login($request, $user);

        // Affichage direct, jamais de codes dans une URL ou dans un flash non chiffré.
        return view('auth.recovery-codes', ['codes' => $codes, 'regenerated' => true]);
    }
}
