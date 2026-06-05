<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\RoleService;
use GuzzleHttp\Client;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\Response;

class GoogleAuthController extends Controller
{
    public function __construct(private readonly RoleService $roleService) {}

    /** Redirige al consentimiento de Google (flujo OAuth stateless para SPA). */
    public function redirect(): RedirectResponse|Response
    {
        if ($redirect = $this->redirectIfNotConfigured()) {
            return $redirect;
        }

        return $this->googleDriver()->redirect();
    }

    /** Callback: crea/actualiza usuario, emite token Sanctum y redirige al frontend. */
    public function callback(): RedirectResponse|Response
    {
        $frontend = rtrim(config('services.frontend.url', 'http://127.0.0.1:4200'), '/');

        if ($redirect = $this->redirectIfNotConfigured()) {
            return $redirect;
        }

        if (request()->has('error')) {
            return redirect("{$frontend}/auth/callback?error=access_denied");
        }

        try {
            $googleUser = $this->googleDriver()->user();
        } catch (\Throwable $e) {
            Log::error('Google OAuth callback failed', [
                'message' => $e->getMessage(),
                'redirect' => $this->googleRedirectUrl(),
            ]);

            return redirect("{$frontend}/auth/callback?error=oauth_failed");
        }

        try {
            $user = User::where('google_id', $googleUser->getId())->first()
                ?? User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'name' => $googleUser->getName() ?? $user->name,
                    'avatar' => $googleUser->getAvatar() ?? $user->avatar,
                    'provider' => 'google',
                ]);
            } else {
                $this->roleService->ensureRolesExist();
                $isFirstUser = User::count() === 0;
                $user = User::create([
                    'google_id' => $googleUser->getId(),
                    'name' => $googleUser->getName() ?? 'Usuario Google',
                    'email' => $googleUser->getEmail(),
                    'avatar' => $googleUser->getAvatar(),
                    'provider' => 'google',
                    'password' => Hash::make(Str::random(32)),
                ]);
                $this->roleService->assignDefaultRole($user, $isFirstUser);
            }

            $this->roleService->syncAdminByConfiguredEmails($user);

            $token = $user->createToken('api_token')->plainTextToken;

            return redirect("{$frontend}/auth/callback?token=".urlencode($token));
        } catch (\Throwable $e) {
            Log::error('Google OAuth user persist failed', ['message' => $e->getMessage()]);

            return redirect("{$frontend}/auth/callback?error=user_create_failed");
        }
    }

    /** Driver Google con CA bundle (fix SSL en Windows) y redirect URI explícita. */
    private function googleDriver(): Provider
    {
        $driver = Socialite::driver('google')
            ->stateless()
            ->redirectUrl($this->googleRedirectUrl());

        if ($ca = $this->caBundlePath()) {
            $driver->setHttpClient(new Client(['verify' => $ca]));
        }

        return $driver;
    }

    private function googleRedirectUrl(): string
    {
        return config('services.google.redirect')
            ?: url('/api/auth/google/callback');
    }

    /** Ruta al bundle de certificados CA (necesario en Windows). */
    private function caBundlePath(): ?string
    {
        foreach ([
            base_path('../tools/php/cacert.pem'),
            storage_path('cacert.pem'),
        ] as $path) {
            $real = realpath($path);
            if ($real) {
                return $real;
            }
        }

        return null;
    }

    /** Redirige al login del frontend si faltan credenciales de Google. */
    private function redirectIfNotConfigured(): ?RedirectResponse
    {
        if (config('services.google.client_id') && config('services.google.client_secret')) {
            return null;
        }

        $frontend = rtrim(config('services.frontend.url', 'http://127.0.0.1:4200'), '/');

        return redirect("{$frontend}/login?error=google_not_configured");
    }
}
