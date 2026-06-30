<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Student;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class PaymentController extends Controller
{
    // Pengamanan sudah ditangani di routes/api.php

    public function index()
    {
        $payments = Payment::with('student')->latest()->paginate(10);
        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'amount' => 'required|numeric',
            'status' => 'required|in:lunas,belum',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        // Generate Nomor Invoice Otomatis
        $validated['invoice_number'] = 'INV-' . date('Ymd') . '-' . rand(100, 999);

        $payment = Payment::create($validated);
        return response()->json(['message' => 'Pembayaran berhasil dicatat', 'data' => $payment], 201);
    }

    public function update(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'amount' => 'required|numeric',
            'status' => 'required|in:lunas,belum',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $payment->update($validated);
        return response()->json(['message' => 'Pembayaran diperbarui', 'data' => $payment]);
    }

    public function destroy($id)
    {
        Payment::destroy($id);
        return response()->json(['message' => 'Pembayaran dihapus'], 200);
    }

    // Fungsi Cetak Kwitansi PDF
    public function receipt($id)
    {
        $payment = Payment::with('student')->findOrFail($id);
        $pdf = Pdf::loadView('exports.payment_receipt', compact('payment'));
        return $pdf->download('kwitansi-' . $payment->invoice_number . '.pdf');
    }
}