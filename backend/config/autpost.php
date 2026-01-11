<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Access Logging Configuration
    |--------------------------------------------------------------------------
    |
    | These settings control the access logging feature. When enabled, all API
    | requests are logged to the database for auditing purposes.
    |
    */

    'access_log' => [
        /*
        |----------------------------------------------------------------------
        | Enable Access Logging
        |----------------------------------------------------------------------
        |
        | When set to true, all API requests will be logged to the access_logs
        | table. This is useful for auditing and debugging purposes.
        |
        | Default: true
        |
        */
        'enabled' => env('ACCESS_LOG_ENABLED', true),

        /*
        |----------------------------------------------------------------------
        | Access Log Retention Days
        |----------------------------------------------------------------------
        |
        | The number of days to retain access logs before they are eligible
        | for cleanup. Set to 0 to disable automatic cleanup (keep forever).
        |
        | Default: 30 days
        |
        */
        'retention_days' => env('ACCESS_LOG_RETENTION_DAYS', 30),
    ],

    /*
    |--------------------------------------------------------------------------
    | Recurring Todo Configuration
    |--------------------------------------------------------------------------
    |
    | These settings control how recurring todos are generated.
    |
    */

    'recurring_todo' => [
        /*
        |----------------------------------------------------------------------
        | Enable Recurring Todo Generation
        |----------------------------------------------------------------------
        |
        | When set to true, the scheduler will automatically generate todos
        | from recurring todo templates.
        |
        | Default: true
        |
        */
        'enabled' => env('RECURRING_TODO_ENABLED', true),

        /*
        |----------------------------------------------------------------------
        | Generation Period
        |----------------------------------------------------------------------
        |
        | How far ahead to generate todos from recurring templates.
        | Supported formats: 1h, 2d, 1w (hours, days, weeks)
        |
        | Default: 1h (1 hour ahead)
        |
        */
        'generation_period' => env('RECURRING_TODO_GENERATION_PERIOD', '1h'),

        /*
        |----------------------------------------------------------------------
        | Schedule Frequency
        |----------------------------------------------------------------------
        |
        | How often to run the recurring todo generation job.
        | Supported values: everyMinute, everyFiveMinutes, everyTenMinutes,
        |                   everyFifteenMinutes, everyThirtyMinutes, hourly,
        |                   daily
        |
        | Default: hourly
        |
        */
        'schedule_frequency' => env('RECURRING_TODO_SCHEDULE_FREQUENCY', 'hourly'),
    ],
];
