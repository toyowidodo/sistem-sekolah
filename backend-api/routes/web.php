<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rute Web
|--------------------------------------------------------------------------
|
| Aplikasi ini murni API — antarmukanya React yang dilayani dari domain
| terpisah. Tidak ada halaman web yang perlu dirender di sini.
|
| Sebelumnya root menampilkan halaman sambutan bawaan Laravel (81 KB berisi
| tautan dokumentasi dan sponsor). Selain tidak dipakai kode mana pun, halaman
| itu mengumumkan teknologi yang dipakai kepada siapa saja yang membukanya.
|
| Sekarang dialihkan ke aplikasinya, supaya yang salah membuka alamat API
| tetap sampai ke tujuan yang benar.
|
*/

Route::get('/', fn () => redirect()->away(config('app.frontend_url', 'https://niswa.online')));
