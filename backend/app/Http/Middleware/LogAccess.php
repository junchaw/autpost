<?php

namespace App\Http\Middleware;

use App\Models\AccessLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogAccess
{
    /**
     * Paths to exclude from logging.
     */
    protected array $excludedPaths = [];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Log after the request is processed
        $this->logAccess($request);

        return $response;
    }

    /**
     * Log the access to the database.
     */
    protected function logAccess(Request $request): void
    {
        $path = $request->path();

        // Skip logging for excluded paths
        if ($this->shouldExclude($path)) {
            return;
        }

        try {
            AccessLog::create([
                'source' => $request->method(),
                'path' => '/'.$path,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent() ?? '',
            ]);
        } catch (\Exception $e) {
            // Silently fail to avoid breaking the request
            // Optionally log to error log: \Log::error('Failed to log access: ' . $e->getMessage());
        }
    }

    /**
     * Check if the path should be excluded from logging.
     */
    protected function shouldExclude(string $path): bool
    {
        foreach ($this->excludedPaths as $pattern) {
            if ($this->pathMatches($path, $pattern)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if the path matches the pattern.
     */
    protected function pathMatches(string $path, string $pattern): bool
    {
        // Convert wildcard pattern to regex
        $regex = str_replace(['*', '/'], ['.*', '\/'], $pattern);

        return (bool) preg_match('/^'.$regex.'$/i', $path);
    }
}
