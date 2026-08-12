<?php

namespace App\Services;

use App\Models\NotificationLog;
use App\Models\NotificationTemplate;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Pengiriman notifikasi keluar (WhatsApp/SMS) lewat gateway yang bisa diganti.
 *
 * Default driver-nya 'log': tidak ada pesan yang benar-benar keluar, hanya
 * dicatat. Ini disengaja supaya sistem tidak pernah mengirim ke orang tua
 * sungguhan sebelum admin sadar mengaktifkannya lewat .env.
 */
class NotificationService
{
    /**
     * Menormalkan nomor HP Indonesia ke format internasional tanpa tanda plus.
     * 08123 -> 628123, +62812 -> 62812, 0812-3456 -> 62812345
     */
    public function normalizePhone(?string $phone): ?string
    {
        if (!$phone) return null;

        $digits = preg_replace('/\D/', '', $phone);
        if (!$digits) return null;

        $cc = config('notification.country_code', '62');

        if (str_starts_with($digits, '0')) {
            return $cc . substr($digits, 1);
        }

        if (!str_starts_with($digits, $cc)) {
            return $cc . $digits;
        }

        return $digits;
    }

    /**
     * Mengirim satu pesan. Selalu mengembalikan NotificationLog — kegagalan
     * dicatat, bukan dilempar, supaya satu nomor bermasalah tidak menghentikan
     * pengiriman massal.
     */
    public function send(string $phone, string $message, array $context = []): NotificationLog
    {
        $driver = config('notification.driver', 'log');
        $target = $this->normalizePhone($phone);

        $log = [
            'template_key'   => $context['template_key'] ?? null,
            'student_id'     => $context['student_id'] ?? null,
            'recipient_name' => $context['recipient_name'] ?? null,
            'recipient_phone' => $target ?? (string) $phone,
            'message'        => $message,
            'driver'         => $driver,
        ];

        if (!$target) {
            return NotificationLog::create($log + [
                'status' => 'dilewati',
                'error'  => 'Nomor HP kosong atau tidak valid.',
            ]);
        }

        // Pengaman uji coba: alihkan semua tujuan ke satu nomor
        $redirect = config('notification.redirect_all_to');
        if ($redirect) {
            $target = $this->normalizePhone($redirect);
            $log['recipient_phone'] = $target;
            $message = "[UJI COBA — tujuan asli {$log['recipient_phone']}]\n" . $message;
        }

        if ($driver === 'log') {
            Log::info('Notifikasi (driver log, tidak dikirim)', [
                'target'  => $target,
                'message' => $message,
            ]);

            return NotificationLog::create($log + [
                'status'  => 'dilewati',
                'error'   => 'Driver "log": pesan tidak dikirim ke gateway mana pun.',
                'sent_at' => now(),
            ]);
        }

        return $this->sendViaHttp($target, $message, $log);
    }

    private function sendViaHttp(string $target, string $message, array $log): NotificationLog
    {
        $cfg = config('notification.http');

        if (empty($cfg['url'])) {
            return NotificationLog::create($log + [
                'status' => 'gagal',
                'error'  => 'NOTIFICATION_GATEWAY_URL belum diisi di .env.',
            ]);
        }

        $payload = [
            $cfg['field_target']  => $target,
            $cfg['field_message'] => $message,
        ];

        $request = Http::timeout($cfg['timeout'] ?? 15);

        if (($cfg['auth_mode'] ?? 'header') === 'header') {
            $request = $request->withHeaders([
                $cfg['auth_header'] ?? 'Authorization' => $cfg['token'],
            ]);
        } else {
            $payload[$cfg['field_token']] = $cfg['token'];
        }

        try {
            $response = $request->asForm()->post($cfg['url'], $payload);

            if ($response->successful()) {
                return NotificationLog::create($log + [
                    'status'  => 'terkirim',
                    'sent_at' => now(),
                ]);
            }

            return NotificationLog::create($log + [
                'status' => 'gagal',
                'error'  => 'HTTP ' . $response->status() . ': ' . mb_substr($response->body(), 0, 500),
            ]);
        } catch (\Throwable $e) {
            return NotificationLog::create($log + [
                'status' => 'gagal',
                'error'  => mb_substr($e->getMessage(), 0, 500),
            ]);
        }
    }

    /** Mengirim berdasarkan template tersimpan */
    public function sendTemplate(string $key, string $phone, array $data, array $context = []): ?NotificationLog
    {
        $template = NotificationTemplate::where('key', $key)->first();

        if (!$template || !$template->is_active) {
            return null;
        }

        return $this->send(
            $phone,
            $template->render($data),
            $context + ['template_key' => $key]
        );
    }
}
