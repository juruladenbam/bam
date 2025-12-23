<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_PUBLIC_URL', 'http://localhost:5173'),
        env('FRONTEND_PORTAL_URL', 'http://localhost:5174'),
        env('FRONTEND_ADMIN_URL', 'http://localhost:5175'),
    ],

    'allowed_origins_patterns' => [
        // Production domains
        '/^https?:\/\/(.+\.)?bamseribuputu\.my\.id$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
