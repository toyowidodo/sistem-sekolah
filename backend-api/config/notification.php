<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Driver Pengiriman
    |--------------------------------------------------------------------------
    |
    | 'log'  : tidak mengirim ke mana pun, hanya mencatat ke notification_logs
    |          dan laravel.log. Ini default yang aman — dipakai untuk menguji
    |          isi pesan sebelum tersambung ke gateway sungguhan.
    |
    | 'http' : mengirim lewat HTTP POST ke gateway WhatsApp mana pun yang
    |          menerima token + nomor tujuan + isi pesan (pola umum gateway
    |          WhatsApp lokal). Nama field-nya bisa disesuaikan di bawah supaya
    |          tidak terikat ke satu vendor.
    |
    */

    'driver' => env('NOTIFICATION_DRIVER', 'log'),

    'http' => [
        'url'    => env('NOTIFICATION_GATEWAY_URL'),
        'token'  => env('NOTIFICATION_GATEWAY_TOKEN'),

        // Cara token dikirim: 'header' (Authorization) atau 'body'
        'auth_mode'   => env('NOTIFICATION_GATEWAY_AUTH_MODE', 'header'),
        'auth_header' => env('NOTIFICATION_GATEWAY_AUTH_HEADER', 'Authorization'),

        // Nama field payload, sesuaikan dengan dokumentasi gateway Anda
        'field_target'  => env('NOTIFICATION_GATEWAY_FIELD_TARGET', 'target'),
        'field_message' => env('NOTIFICATION_GATEWAY_FIELD_MESSAGE', 'message'),
        'field_token'   => env('NOTIFICATION_GATEWAY_FIELD_TOKEN', 'token'),

        'timeout' => (int) env('NOTIFICATION_GATEWAY_TIMEOUT', 15),
    ],

    /*
    |--------------------------------------------------------------------------
    | Pengaman
    |--------------------------------------------------------------------------
    |
    | Kalau diisi, SEMUA notifikasi dialihkan ke nomor ini apa pun tujuannya.
    | Berguna saat uji coba supaya tidak sengaja mengirim ke orang tua sungguhan.
    |
    */

    'redirect_all_to' => env('NOTIFICATION_REDIRECT_ALL_TO'),

    /*
    | Kode negara default untuk normalisasi nomor (08xx -> 628xx).
    */
    'country_code' => env('NOTIFICATION_COUNTRY_CODE', '62'),

];
