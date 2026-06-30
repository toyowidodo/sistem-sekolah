<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #f4f7fb; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; padding: 40px 16px; }

  .kwit-card { background: #fff; border: 1px solid #d8e4f0; border-radius: 12px; width: 100%; max-width: 640px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.07); }

  .kwit-header { background: #1a3a6e; padding: 1.4rem 2rem; display: flex; align-items: center; gap: 1rem; }
  .kwit-logo { width: 54px; height: 54px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; color: #1a3a6e; flex-shrink: 0; }
  .kwit-school-name { font-size: 15px; font-weight: 600; color: #fff; }
  .kwit-school-sub { font-size: 11px; color: #a8c4e8; margin-top: 2px; }
  .kwit-badge { margin-left: auto; background: #fff; color: #1a3a6e; font-size: 10.5px; font-weight: 600; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.5px; flex-shrink: 0; }

  .kwit-titlebar { background: #f0f5fb; border-bottom: 1px solid #c8d8ee; padding: 9px 2rem; display: flex; justify-content: space-between; align-items: center; }
  .kwit-title { font-size: 12.5px; font-weight: 600; color: #1a3a6e; letter-spacing: 1px; }
  .kwit-invno { font-size: 12px; color: #4a6a9a; }

  .kwit-body { padding: 1.5rem 2rem; }
  .section-label { font-size: 10px; font-weight: 600; color: #7a90aa; letter-spacing: 0.8px; text-transform: uppercase; margin: 0 0 8px; }
  .kwit-row { display: flex; align-items: flex-start; padding: 7px 0; border-bottom: 0.5px solid #e8eef5; }
  .kwit-row:last-child { border-bottom: none; }
  .kwit-label { font-size: 12px; color: #5a6e85; width: 140px; flex-shrink: 0; padding-top: 1px; }
  .kwit-value { font-size: 13px; color: #1a2a40; font-weight: 500; flex: 1; }
  .divider { height: 0.5px; background: #e0eaf5; margin: 1rem 0; }

  .amount-box { background: #f0f5fb; border: 1px solid #c8d8ee; border-radius: 8px; padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; margin: 1rem 0; }
  .amount-label { font-size: 12px; color: #4a6a9a; font-weight: 500; }
  .amount-value { font-size: 22px; font-weight: 600; color: #1a3a6e; }

  .status-lunas { display: inline-block; background: #eaf3de; color: #3b6d11; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 4px; }
  .status-pending { display: inline-block; background: #faeeda; color: #854f0b; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 4px; }

  .kwit-note { background: #f8fafc; border-left: 3px solid #4a6a9a; padding: 8px 12px; border-radius: 0 4px 4px 0; margin-top: 1rem; font-size: 12px; color: #4a6080; }
  .kwit-note strong { font-size: 11px; display: block; margin-bottom: 3px; color: #1a2a40; }

  .kwit-footer { background: #f8fafc; border-top: 1px solid #e0eaf5; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
  .footer-note { font-size: 10.5px; color: #7a90aa; }
  .kwit-ttd { text-align: center; }
  .kwit-ttd-label { font-size: 11px; color: #5a6e85; margin-bottom: 44px; }
  .kwit-ttd-line { border-top: 1px solid #b0c0d4; padding-top: 6px; font-size: 11.5px; font-weight: 500; color: #1a2a40; }
  .kwit-ttd-role { font-size: 10.5px; color: #7a90aa; }
</style>
</head>
<body>
<div class="kwit-card">

  <div class="kwit-header">
    <div class="kwit-logo">SN</div>
    <div>
      <div class="kwit-school-name">SMA/SMP NURUL ILMI</div>
      <div class="kwit-school-sub">Banyuasin, Sumatera Selatan &mdash; Terakreditasi</div>
    </div>
    <div class="kwit-badge">RESMI</div>
  </div>

  <div class="kwit-titlebar">
    <span class="kwit-title">KWITANSI PEMBAYARAN</span>
    <span class="kwit-invno">No: {{ $payment->invoice_number }}</span>
  </div>

  <div class="kwit-body">

    <p class="section-label">Informasi Siswa</p>
    <div class="kwit-row">
      <span class="kwit-label">Nama Siswa</span>
      <span class="kwit-value">{{ $payment->student->name }}</span>
    </div>
    <div class="kwit-row">
      <span class="kwit-label">NISN</span>
      <span class="kwit-value">{{ $payment->student->nisn }}</span>
    </div>

    <div class="divider"></div>
    <p class="section-label">Detail Pembayaran</p>

    <div class="kwit-row">
      <span class="kwit-label">Tanggal Bayar</span>
      <span class="kwit-value">{{ date('d F Y', strtotime($payment->payment_date)) }}</span>
    </div>
    <div class="kwit-row">
      <span class="kwit-label">Status</span>
      <span class="kwit-value">
        @php $s = strtolower($payment->status); @endphp
        @if($s === 'paid' || $s === 'lunas')
          <span class="status-lunas">&#10003; LUNAS</span>
        @else
          <span class="status-pending">{{ strtoupper($payment->status) }}</span>
        @endif
      </span>
    </div>

    <div class="amount-box">
      <span class="amount-label">Jumlah Dibayar</span>
      <span class="amount-value">Rp {{ number_format($payment->amount, 0, ',', '.') }}</span>
    </div>

    @if($payment->notes)
    <div class="kwit-note">
      <strong>Catatan</strong>
      {{ $payment->notes }}
    </div>
    @endif

  </div>

  <div class="kwit-footer">
    <div class="footer-note">Diterbitkan otomatis oleh sistem keuangan sekolah.</div>
    <div class="kwit-ttd">
      <div class="kwit-ttd-label">Bendahara Sekolah,</div>
      <div class="kwit-ttd-line">___________________</div>
      <div class="kwit-ttd-role">Bendahara</div>
    </div>
  </div>

</div>
</body>
</html>