<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\RoleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function __construct(private readonly RoleService $roleService) {}

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $isFirstUser = User::count() === 0;

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'provider' => 'local',
        ]);

        $this->roleService->assignDefaultRole($user, $isFirstUser);

        return $this->tokenResponse($user, 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! $user->password || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        if ($user->isBanned()) {
            return response()->json(['message' => 'Tu cuenta ha sido suspendida'], 403);
        }

        return $this->tokenResponse($user);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada']);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email']]);
        $email = $data['email'];
        $user = User::where('email', $email)->where('provider', 'local')->first();
        $payload = ['message' => 'Si el email existe, recibirás instrucciones para restablecer la contraseña.'];

        if (! $user) {
            return response()->json($payload);
        }

        $token = Str::random(64);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        if (config('app.debug')) {
            $payload['debug_token'] = $token;
            $payload['debug_email'] = $email;
        }

        return response()->json($payload);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $email = $data['email'];
        $row = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (! $row || ! Hash::check($data['token'], $row->token)) {
            return response()->json(['message' => 'Token inválido o expirado'], 422);
        }

        if ($row->created_at && now()->diffInHours($row->created_at) > 24) {
            return response()->json(['message' => 'Token expirado'], 422);
        }

        $user = User::where('email', $email)->where('provider', 'local')->first();
        if (! $user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $user->update(['password' => $data['password']]);
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        return response()->json(['message' => 'Contraseña restablecida correctamente']);
    }

    private function tokenResponse(User $user, int $status = 200): JsonResponse
    {
        if ($user->isBanned()) {
            return response()->json(['message' => 'Tu cuenta ha sido suspendida'], 403);
        }

        $user->load('roles');
        $token = $user->createToken('api_token')->plainTextToken;

        return response()->json([
            'user' => $user->fresh()->load('roles'),
            'token' => $token,
        ], $status);
    }
}
