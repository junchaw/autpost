<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'Autpost API',
    description: 'API documentation for the Autpost application'
)]
#[OA\Server(
    url: 'http://localhost:9527/api',
    description: 'Local development server'
)]
#[OA\SecurityScheme(
    securityScheme: 'bearerAuth',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'token',
    description: 'Enter your Sanctum token'
)]
abstract class Controller
{
    //
}
