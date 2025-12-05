<?php

use App\Enums\Permission;
use App\Http\Controllers\Api\AccessLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConfigController;
use App\Http\Controllers\Api\GenericDefinitionController;
use App\Http\Controllers\Api\GenericResourceController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\RecurringTodoController;
use App\Http\Controllers\Api\RoleBindingController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\TodoController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
    ]);
});

Route::post('/login', [AuthController::class, 'login']);

// Registration routes
Route::post('/register', [AuthController::class, 'registerRequest']);
Route::post('/register/verify', [AuthController::class, 'registerVerify']);

// Password reset routes
Route::post('/password/reset-request', [AuthController::class, 'passwordResetRequest']);
Route::post('/password/verify', [AuthController::class, 'passwordResetVerify']);
Route::post('/password/reset', [AuthController::class, 'passwordReset']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // User profile routes
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::post('/user/avatar', [UserController::class, 'uploadAvatar']);
    Route::delete('/user/avatar', [UserController::class, 'deleteAvatar']);
    Route::post('/user/email/request', [UserController::class, 'emailChangeRequest']);
    Route::post('/user/email/verify', [UserController::class, 'emailChangeVerify']);
    Route::post('/user/password', [UserController::class, 'changePassword']);

    // Config routes
    Route::get('/config', [ConfigController::class, 'show']);
    Route::post('/config', [ConfigController::class, 'update']);

    // Todo routes
    Route::prefix('todos')->group(function () {
        Route::get('/', [TodoController::class, 'index']);
        Route::post('/', [TodoController::class, 'store']);
        Route::get('/{id}', [TodoController::class, 'show']);
        Route::put('/{id}', [TodoController::class, 'update']);
        Route::delete('/{id}', [TodoController::class, 'destroy']);
        Route::post('/{id}/restore', [TodoController::class, 'restore']);
        Route::delete('/{id}/force', [TodoController::class, 'forceDelete'])->middleware('permission:'.Permission::HARD_DELETE);
    });

    // Recurring Todo routes
    Route::prefix('recurring-todos')->group(function () {
        Route::get('/', [RecurringTodoController::class, 'index']);
        Route::post('/', [RecurringTodoController::class, 'store']);
        Route::post('/generate', [RecurringTodoController::class, 'generate'])->middleware('permission:'.Permission::GENERATE_RECURRING_TODOS);
        Route::get('/{id}', [RecurringTodoController::class, 'show']);
        Route::put('/{id}', [RecurringTodoController::class, 'update']);
        Route::delete('/{id}', [RecurringTodoController::class, 'destroy']);
        Route::post('/{id}/restore', [RecurringTodoController::class, 'restore']);
        Route::delete('/{id}/force', [RecurringTodoController::class, 'forceDelete'])->middleware('permission:'.Permission::HARD_DELETE);

        Route::post('/{id}/pause', [RecurringTodoController::class, 'pause']);
        Route::post('/{id}/resume', [RecurringTodoController::class, 'resume']);
    });

    // Note routes
    Route::prefix('notes')->group(function () {
        Route::get('/', [NoteController::class, 'index']);
        Route::post('/', [NoteController::class, 'store']);
        Route::get('/{id}', [NoteController::class, 'show']);
        Route::put('/{id}', [NoteController::class, 'update']);
        Route::delete('/{id}', [NoteController::class, 'destroy']);
        Route::post('/{id}/restore', [NoteController::class, 'restore']);
        Route::delete('/{id}/force', [NoteController::class, 'forceDelete'])->middleware('permission:'.Permission::HARD_DELETE);
    });

    // Access Log routes
    Route::prefix('access-logs')->group(function () {
        Route::get('/', [AccessLogController::class, 'index']);
        Route::post('/', [AccessLogController::class, 'store']);
        Route::get('/{id}', [AccessLogController::class, 'show']);
        Route::put('/{id}', [AccessLogController::class, 'update']);
        Route::delete('/{id}', [AccessLogController::class, 'destroy']);
    });

    // Role routes
    Route::prefix('roles')->group(function () {
        Route::get('/permissions', [RoleController::class, 'permissions']);
        Route::get('/', [RoleController::class, 'index']);
        Route::post('/', [RoleController::class, 'store']);
        Route::get('/{id}', [RoleController::class, 'show']);
        Route::put('/{id}', [RoleController::class, 'update']);
        Route::delete('/{id}', [RoleController::class, 'destroy']);
    });

    // Role Binding routes
    Route::prefix('role-bindings')->group(function () {
        Route::get('/', [RoleBindingController::class, 'index']);
        Route::post('/', [RoleBindingController::class, 'store']);
        Route::get('/{id}', [RoleBindingController::class, 'show']);
        Route::delete('/{id}', [RoleBindingController::class, 'destroy']);
    });

    // Users list for role binding
    Route::get('/users', [RoleBindingController::class, 'users']);

    // Generic Definition routes (MongoDB)
    Route::prefix('definitions')->group(function () {
        Route::get('/field-types', [GenericDefinitionController::class, 'fieldTypes']);
        Route::get('/', [GenericDefinitionController::class, 'index']);
        Route::post('/', [GenericDefinitionController::class, 'store']);
        Route::get('/by-type/{type}', [GenericDefinitionController::class, 'showByType']);
        Route::get('/{id}', [GenericDefinitionController::class, 'show']);
        Route::put('/{id}', [GenericDefinitionController::class, 'update']);
        Route::delete('/{id}', [GenericDefinitionController::class, 'destroy']);
    });

    // Generic Resource routes (MongoDB)
    Route::prefix('resources')->group(function () {
        Route::get('/{type}', [GenericResourceController::class, 'index']);
        Route::post('/{type}', [GenericResourceController::class, 'store']);
        Route::get('/{type}/{id}', [GenericResourceController::class, 'show']);
        Route::put('/{type}/{id}', [GenericResourceController::class, 'update']);
        Route::delete('/{type}/{id}', [GenericResourceController::class, 'destroy']);
    });
});
