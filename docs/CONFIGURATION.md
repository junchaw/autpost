# Configuration Guide

This document describes the configurable options for Autpost. All settings can be configured via environment variables in your `.env` file or directly in `backend/config/autpost.php`.

## Table of Contents

- [Access Logging](#access-logging)
- [Recurring Todo Generation](#recurring-todo-generation)
- [Artisan Commands](#artisan-commands)

---

## Access Logging

Access logging records all API requests to the database for auditing and debugging purposes.

### Environment Variables

| Variable                    | Type    | Default | Description                                                                                |
| --------------------------- | ------- | ------- | ------------------------------------------------------------------------------------------ |
| `ACCESS_LOG_ENABLED`        | boolean | `true`  | Enable or disable access logging                                                           |
| `ACCESS_LOG_RETENTION_DAYS` | integer | `30`    | Number of days to retain logs before cleanup. Set to `0` to disable cleanup (keep forever) |

### Configuration Details

#### `ACCESS_LOG_ENABLED`

When set to `true`, all API requests are logged to the `access_logs` table with the following information:

- **source**: HTTP method (GET, POST, PUT, DELETE, etc.)
- **path**: The request path (e.g., `/api/users`)
- **ip**: Client IP address
- **user_agent**: Client user agent string

```env
# Enable access logging (default)
ACCESS_LOG_ENABLED=true

# Disable access logging
ACCESS_LOG_ENABLED=false
```

#### `ACCESS_LOG_RETENTION_DAYS`

Controls how long access logs are retained before being automatically deleted by the daily cleanup job.

```env
# Keep logs for 30 days (default)
ACCESS_LOG_RETENTION_DAYS=30

# Keep logs for 7 days
ACCESS_LOG_RETENTION_DAYS=7

# Keep logs for 90 days
ACCESS_LOG_RETENTION_DAYS=90

# Disable automatic cleanup (keep forever)
ACCESS_LOG_RETENTION_DAYS=0
```

**Note**: When set to `0`, the cleanup job will not be scheduled, and logs will accumulate indefinitely. Consider storage implications for high-traffic applications.

---

## Recurring Todo Generation

Recurring todos allow users to create templates that automatically generate todo items on a schedule.

### Environment Variables

| Variable                            | Type    | Default  | Description                                 |
| ----------------------------------- | ------- | -------- | ------------------------------------------- |
| `RECURRING_TODO_ENABLED`            | boolean | `true`   | Enable or disable recurring todo generation |
| `RECURRING_TODO_GENERATION_PERIOD`  | string  | `1h`     | How far ahead to generate todos             |
| `RECURRING_TODO_SCHEDULE_FREQUENCY` | string  | `hourly` | How often to run the generation job         |

### Configuration Details

#### `RECURRING_TODO_ENABLED`

Controls whether the recurring todo generation job runs.

```env
# Enable recurring todo generation (default)
RECURRING_TODO_ENABLED=true

# Disable recurring todo generation
RECURRING_TODO_ENABLED=false
```

#### `RECURRING_TODO_GENERATION_PERIOD`

Determines how far into the future todos are generated from recurring templates.

**Supported formats**:

- `Xs` - seconds (e.g., `30s`)
- `Xm` - minutes (e.g., `15m`)
- `Xh` - hours (e.g., `1h`, `6h`)
- `Xd` - days (e.g., `1d`, `7d`)
- `Xw` - weeks (e.g., `1w`, `2w`)

```env
# Generate todos 1 hour ahead (default)
RECURRING_TODO_GENERATION_PERIOD=1h

# Generate todos 6 hours ahead
RECURRING_TODO_GENERATION_PERIOD=6h

# Generate todos 1 day ahead
RECURRING_TODO_GENERATION_PERIOD=1d

# Generate todos 1 week ahead
RECURRING_TODO_GENERATION_PERIOD=1w
```

**Recommendation**: Match this value to your `RECURRING_TODO_SCHEDULE_FREQUENCY`. For example, if the job runs hourly, generating 1 hour ahead ensures todos are created just in time.

#### `RECURRING_TODO_SCHEDULE_FREQUENCY`

Controls how often the generation job runs.

**Supported values**:

- `everyMinute` - Every minute
- `everyFiveMinutes` - Every 5 minutes
- `everyTenMinutes` - Every 10 minutes
- `everyFifteenMinutes` - Every 15 minutes
- `everyThirtyMinutes` - Every 30 minutes
- `hourly` - Every hour (default)
- `daily` - Once per day

```env
# Run every hour (default)
RECURRING_TODO_SCHEDULE_FREQUENCY=hourly

# Run every 5 minutes (for sub-hour recurring todos)
RECURRING_TODO_SCHEDULE_FREQUENCY=everyFiveMinutes

# Run once daily (for daily or longer recurring todos)
RECURRING_TODO_SCHEDULE_FREQUENCY=daily
```

**Recommendation**: Choose a frequency appropriate for your shortest recurring interval:

- If you have minute-level recurring todos, use `everyMinute`
- If your shortest interval is hourly, use `hourly`
- If your shortest interval is daily, use `daily`

---

## Artisan Commands

### Access Log Cleanup

Manually trigger access log cleanup:

```bash
# Use configured retention days
php artisan access-logs:cleanup

# Override retention days
php artisan access-logs:cleanup --days=7

# Dry run (show what would be deleted)
php artisan access-logs:cleanup --dry-run
```

### Recurring Todo Generation

Manually trigger recurring todo generation:

```bash
# Use default period (1 hour ahead)
php artisan todos:generate

# Generate 1 day ahead
php artisan todos:generate 1d

# Generate 1 week ahead
php artisan todos:generate 1w
```

---

## Example Configurations

### Development Environment

Minimal logging, fast generation for testing:

```env
ACCESS_LOG_ENABLED=true
ACCESS_LOG_RETENTION_DAYS=7
RECURRING_TODO_ENABLED=true
RECURRING_TODO_GENERATION_PERIOD=1d
RECURRING_TODO_SCHEDULE_FREQUENCY=everyMinute
```

### Production Environment

Standard settings for production use:

```env
ACCESS_LOG_ENABLED=true
ACCESS_LOG_RETENTION_DAYS=90
RECURRING_TODO_ENABLED=true
RECURRING_TODO_GENERATION_PERIOD=1h
RECURRING_TODO_SCHEDULE_FREQUENCY=hourly
```

### High-Traffic Environment

Disable logging to reduce database load:

```env
ACCESS_LOG_ENABLED=false
ACCESS_LOG_RETENTION_DAYS=0
RECURRING_TODO_ENABLED=true
RECURRING_TODO_GENERATION_PERIOD=6h
RECURRING_TODO_SCHEDULE_FREQUENCY=hourly
```

---

## Running the Scheduler

For scheduled jobs to run, ensure the Laravel scheduler is configured in your cron:

```bash
* * * * * cd /path-to-your-project/backend && php artisan schedule:run >> /dev/null 2>&1
```

Or use Laravel's built-in scheduler worker for development:

```bash
php artisan schedule:work
```
