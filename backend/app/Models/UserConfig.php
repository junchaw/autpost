<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserConfig extends Model
{
    protected $fillable = [
        'user_id',
        'config',
    ];

    protected $casts = [
        'config' => 'array',
    ];
}
