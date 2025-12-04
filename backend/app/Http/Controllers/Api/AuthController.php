<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\VerificationCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login and create a new token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Revoke existing tokens for this device
        $user->tokens()->where('name', 'web')->delete();

        // Create new token
        $token = $user->createToken('web')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Logout and revoke the current token.
     */
    public function logout(Request $request)
    {
        // Revoke the current token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get the authenticated user.
     */
    public function user(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
            ],
        ]);
    }

    /**
     * Step 1: Request registration - sends verification code to email.
     */
    public function registerRequest(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        // Create verification code with registration data
        $verificationCode = VerificationCode::createForRegistration(
            $request->email,
            [
                'name' => $request->name,
                'email' => $request->email,
                'password' => $request->password,
            ]
        );

        // Log the code for development (in production, send via email)
        Log::info("Registration verification code for {$request->email}: {$verificationCode->code}");

        return response()->json([
            'message' => 'Verification code sent to your email.',
            // Include code in response for development only
            'code' => app()->environment('local') ? $verificationCode->code : null,
        ]);
    }

    /**
     * Step 2: Verify code and complete registration.
     */
    public function registerVerify(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $verificationCode = VerificationCode::findValidCode(
            $request->email,
            $request->code,
            'registration'
        );

        if (! $verificationCode) {
            throw ValidationException::withMessages([
                'code' => ['Invalid or expired verification code.'],
            ]);
        }

        // Create the user
        $userData = $verificationCode->payload;
        $user = User::create([
            'name' => $userData['name'],
            'email' => $userData['email'],
            'password' => $userData['password'],
        ]);

        // Mark code as verified and delete it
        $verificationCode->update(['verified_at' => now()]);
        $verificationCode->delete();

        // Create token for immediate login
        $token = $user->createToken('web')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Step 1: Request password reset - sends verification code to email.
     */
    public function passwordResetRequest(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $verificationCode = VerificationCode::createForPasswordReset($request->email);

        // Log the code for development (in production, send via email)
        Log::info("Password reset verification code for {$request->email}: {$verificationCode->code}");

        return response()->json([
            'message' => 'Verification code sent to your email.',
            // Include code in response for development only
            'code' => app()->environment('local') ? $verificationCode->code : null,
        ]);
    }

    /**
     * Step 2: Verify code for password reset.
     */
    public function passwordResetVerify(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $verificationCode = VerificationCode::findValidCode(
            $request->email,
            $request->code,
            'password_reset'
        );

        if (! $verificationCode) {
            throw ValidationException::withMessages([
                'code' => ['Invalid or expired verification code.'],
            ]);
        }

        // Mark as verified but don't delete yet (needed for password reset)
        $verificationCode->update(['verified_at' => now()]);

        return response()->json([
            'message' => 'Code verified. You can now reset your password.',
        ]);
    }

    /**
     * Step 3: Reset password with verified code.
     */
    public function passwordReset(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:6|confirmed',
        ]);

        // Find verified code
        $verificationCode = VerificationCode::where('email', $request->email)
            ->where('code', $request->code)
            ->where('type', 'password_reset')
            ->whereNotNull('verified_at')
            ->where('expires_at', '>', now())
            ->first();

        if (! $verificationCode) {
            throw ValidationException::withMessages([
                'code' => ['Invalid or expired verification code. Please request a new one.'],
            ]);
        }

        // Update user password
        $user = User::where('email', $request->email)->first();
        $user->update(['password' => $request->password]);

        // Delete the verification code
        $verificationCode->delete();

        // Revoke all tokens
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password reset successful. Please login with your new password.',
        ]);
    }
}
