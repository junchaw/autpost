<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VerificationCode extends Model
{
    protected $fillable = [
        'email',
        'code',
        'type',
        'payload',
        'expires_at',
        'verified_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'expires_at' => 'datetime',
        'verified_at' => 'datetime',
    ];

    /**
     * Check if the code has expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if the code has been verified.
     */
    public function isVerified(): bool
    {
        return $this->verified_at !== null;
    }

    /**
     * Generate a random 6-digit code.
     */
    public static function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Create a new verification code for registration.
     */
    public static function createForRegistration(string $email, array $userData): self
    {
        // Delete any existing codes for this email and type
        self::where('email', $email)->where('type', 'registration')->delete();

        return self::create([
            'email' => $email,
            'code' => self::generateCode(),
            'type' => 'registration',
            'payload' => $userData,
            'expires_at' => now()->addMinutes(15),
        ]);
    }

    /**
     * Create a new verification code for password reset.
     */
    public static function createForPasswordReset(string $email): self
    {
        // Delete any existing codes for this email and type
        self::where('email', $email)->where('type', 'password_reset')->delete();

        return self::create([
            'email' => $email,
            'code' => self::generateCode(),
            'type' => 'password_reset',
            'expires_at' => now()->addMinutes(15),
        ]);
    }

    /**
     * Find a valid (non-expired, non-verified) code.
     */
    public static function findValidCode(string $email, string $code, string $type): ?self
    {
        return self::where('email', $email)
            ->where('code', $code)
            ->where('type', $type)
            ->whereNull('verified_at')
            ->where('expires_at', '>', now())
            ->first();
    }

    /**
     * Create a new verification code for email change.
     */
    public static function createForEmailChange(string $newEmail, int $userId): self
    {
        // Delete any existing codes for this email and type
        self::where('email', $newEmail)->where('type', 'email_change')->delete();

        return self::create([
            'email' => $newEmail,
            'code' => self::generateCode(),
            'type' => 'email_change',
            'payload' => ['user_id' => $userId, 'new_email' => $newEmail],
            'expires_at' => now()->addMinutes(15),
        ]);
    }
}
