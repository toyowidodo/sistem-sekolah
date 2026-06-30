<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MailController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type'); // 'incoming' or 'outgoing'
        $mails = Mail::when($type, function($query) use ($type) {
            $query->where('type', $type);
        })->latest('date')->get();

        return response()->json($mails);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:incoming,outgoing',
            'reference_number' => 'required|unique:mails',
            'entity' => 'required|string',
            'subject' => 'required|string',
            'date' => 'required|date',
            'received_date' => 'nullable|date',
            'disposition' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120', // Max 5MB
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('eoffice_mails', 'public');
            $validated['file_path'] = $path;
        }

        $mail = Mail::create($validated);
        return response()->json($mail, 201);
    }

    public function show(Mail $mail)
    {
        return response()->json($mail);
    }

    public function update(Request $request, Mail $mail)
    {
        $validated = $request->validate([
            'type' => 'required|in:incoming,outgoing',
            'reference_number' => 'required|unique:mails,reference_number,' . $mail->id,
            'entity' => 'required|string',
            'subject' => 'required|string',
            'date' => 'required|date',
            'received_date' => 'nullable|date',
            'disposition' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        if ($request->hasFile('file')) {
            if ($mail->file_path) {
                Storage::disk('public')->delete($mail->file_path);
            }
            $path = $request->file('file')->store('eoffice_mails', 'public');
            $validated['file_path'] = $path;
        }

        $mail->update($validated);
        return response()->json($mail);
    }

    public function destroy(Mail $mail)
    {
        if ($mail->file_path) {
            Storage::disk('public')->delete($mail->file_path);
        }
        $mail->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
