<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VerificationCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'User', description: 'User profile management endpoints')]
class UserController extends Controller
{
    #[OA\Post(
        path: '/user/avatar',
        summary: 'Upload user avatar',
        security: [['bearerAuth' => []]],
        tags: ['User'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    required: ['avatar'],
                    properties: [
                        new OA\Property(property: 'avatar', type: 'string', format: 'binary'),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Avatar uploaded successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $user = $request->user();

        // Delete old avatar if exists
        if ($user->avatar) {
            $oldPath = str_replace('/storage/', '', $user->avatar);
            Storage::disk('public')->delete($oldPath);
        }

        // Store new avatar
        $file = $request->file('avatar');
        $filename = 'avatars/'.$user->id.'_'.Str::random(10).'.'.$file->getClientOriginalExtension();
        $file->storeAs('public', $filename);

        // Update user avatar path
        $user->update([
            'avatar' => '/storage/'.$filename,
        ]);

        return response()->json([
            'message' => 'Avatar uploaded successfully',
            'avatar' => $user->avatar,
        ]);
    }

    #[OA\Delete(
        path: '/user/avatar',
        summary: 'Delete user avatar',
        security: [['bearerAuth' => []]],
        tags: ['User'],
        responses: [
            new OA\Response(response: 200, description: 'Avatar deleted successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function deleteAvatar(Request $request)
    {
        $user = $request->user();

        if ($user->avatar) {
            $oldPath = str_replace('/storage/', '', $user->avatar);
            Storage::disk('public')->delete($oldPath);

            $user->update(['avatar' => null]);
        }

        return response()->json([
            'message' => 'Avatar deleted successfully',
        ]);
    }

    #[OA\Patch(
        path: '/user/profile',
        summary: 'Update user profile',
        security: [['bearerAuth' => []]],
        tags: ['User'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'name', type: 'string', maxLength: 255),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Profile updated successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
        ]);

        $user = $request->user();
        $user->update($request->only(['name']));

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
            ],
        ]);
    }

    #[OA\Post(
        path: '/user/email/request',
        summary: 'Request email change - sends verification code to new email',
        security: [['bearerAuth' => []]],
        tags: ['User'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Verification code sent'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function emailChangeRequest(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
        ]);

        $user = $request->user();
        $newEmail = $request->email;

        $verificationCode = VerificationCode::createForEmailChange($newEmail, $user->id);

        // Log the code for development (in production, send via email)
        Log::info("Email change verification code for {$newEmail}: {$verificationCode->code}");

        return response()->json([
            'message' => 'Verification code sent to your new email.',
            'code' => app()->environment('local') ? $verificationCode->code : null,
        ]);
    }

    #[OA\Post(
        path: '/user/email/verify',
        summary: 'Verify email change code and update email',
        security: [['bearerAuth' => []]],
        tags: ['User'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'code'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email'),
                    new OA\Property(property: 'code', type: 'string', minLength: 6, maxLength: 6),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Email updated successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function emailChangeVerify(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        $verificationCode = VerificationCode::findValidCode(
            $request->email,
            $request->code,
            'email_change'
        );

        if (! $verificationCode) {
            throw ValidationException::withMessages([
                'code' => ['Invalid or expired verification code.'],
            ]);
        }

        // Verify the code belongs to this user
        if ($verificationCode->payload['user_id'] !== $user->id) {
            throw ValidationException::withMessages([
                'code' => ['Invalid verification code.'],
            ]);
        }

        // Update the email
        $user->update(['email' => $request->email]);

        // Delete the verification code
        $verificationCode->delete();

        return response()->json([
            'message' => 'Email updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
            ],
        ]);
    }

    #[OA\Post(
        path: '/user/password',
        summary: 'Change user password',
        security: [['bearerAuth' => []]],
        tags: ['User'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['current_password', 'password', 'password_confirmation'],
                properties: [
                    new OA\Property(property: 'current_password', type: 'string'),
                    new OA\Property(property: 'password', type: 'string', minLength: 8),
                    new OA\Property(property: 'password_confirmation', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Password changed successfully'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        // Verify current password
        if (! Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Password changed successfully',
        ]);
    }
}
