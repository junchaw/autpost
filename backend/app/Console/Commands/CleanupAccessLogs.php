<?php

namespace App\Console\Commands;

use App\Models\AccessLog;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CleanupAccessLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'access-logs:cleanup
                            {--days= : Number of days to retain (overrides config)}
                            {--dry-run : Show what would be deleted without actually deleting}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete access logs older than the configured retention period';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $retentionDays = $this->option('days') ?? config('autpost.access_log.retention_days', 30);
        $dryRun = $this->option('dry-run');

        if ($retentionDays <= 0) {
            $this->info('Access log cleanup is disabled (retention_days = 0).');

            return Command::SUCCESS;
        }

        $cutoffDate = Carbon::now()->subDays($retentionDays);

        $query = AccessLog::where('created_at', '<', $cutoffDate);
        $count = $query->count();

        if ($count === 0) {
            $this->info('No access logs older than '.$retentionDays.' days found.');

            return Command::SUCCESS;
        }

        if ($dryRun) {
            $this->info("[Dry Run] Would delete {$count} access logs older than {$retentionDays} days (before {$cutoffDate}).");

            return Command::SUCCESS;
        }

        $deleted = $query->delete();

        $this->info("Deleted {$deleted} access logs older than {$retentionDays} days.");

        return Command::SUCCESS;
    }
}
