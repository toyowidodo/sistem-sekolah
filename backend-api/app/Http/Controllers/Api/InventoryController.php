<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\InventoryLoan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Inventory::query();

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }
        if ($request->filled('condition') && $request->condition !== 'all') {
            $query->where('condition', $request->condition);
        }
        if ($request->filled('location') && $request->location !== 'all') {
            $query->where('location', $request->location);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('item_code', 'like', "%{$search}%");
            });
        }

        $inventories = $query->orderBy('created_at', 'desc')->get();

        $summary = [
            'total_items' => $inventories->sum('quantity'),
            'total_value' => $inventories->sum(function($item) {
                return $item->quantity * $item->price;
            }),
            'good_condition' => $inventories->where('condition', 'baik')->sum('quantity'),
            'bad_condition' => $inventories->whereIn('condition', ['rusak_ringan', 'rusak_berat'])->sum('quantity')
        ];

        return response()->json([
            'data' => $inventories,
            'summary' => $summary
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_code' => 'required|string|unique:inventories,item_code',
            'name' => 'required|string|max:255',
            'category' => 'required|in:elektronik,furnitur,buku,alat_tulis,lainnya',
            'quantity' => 'required|integer|min:1',
            'condition' => 'required|in:baik,rusak_ringan,rusak_berat',
            'location' => 'nullable|string|max:255',
            'purchase_date' => 'nullable|date',
            'price' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        if ($request->hasFile('image')) {
            // Simpan path relatifnya saja; URL dibangun oleh accessor di model
            $validated['image'] = $request->file('image')->store('inventories', 'public');
        }

        $inventory = Inventory::create($validated);
        return response()->json(['message' => 'Aset berhasil ditambahkan', 'data' => $inventory], 201);
    }

    public function update(Request $request, $id)
    {
        $inventory = Inventory::findOrFail($id);
        $validated = $request->validate([
            'item_code' => "required|string|unique:inventories,item_code,{$id}",
            'name' => 'required|string|max:255',
            'category' => 'required|in:elektronik,furnitur,buku,alat_tulis,lainnya',
            'quantity' => 'required|integer|min:1',
            'condition' => 'required|in:baik,rusak_ringan,rusak_berat',
            'location' => 'nullable|string|max:255',
            'purchase_date' => 'nullable|date',
            'price' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        if ($request->hasFile('image')) {
            // Hapus gambar lama jika ada
            // getRawOriginal dipakai karena $inventory->image sudah berupa URL
            // lengkap hasil accessor
            if ($old = $inventory->getRawOriginal('image')) {
                Storage::disk('public')->delete($old);
            }
            $validated['image'] = $request->file('image')->store('inventories', 'public');
        }

        $inventory->update($validated);
        return response()->json(['message' => 'Aset berhasil diperbarui', 'data' => $inventory]);
    }

    public function destroy($id)
    {
        $inventory = Inventory::findOrFail($id);
        if ($old = $inventory->getRawOriginal('image')) {
            Storage::disk('public')->delete($old);
        }
        $inventory->delete();
        return response()->json(['message' => 'Aset berhasil dihapus']);
    }

    /**
     * Ambil satu aset berdasarkan kode yang dipindai.
     *
     * Sengaja jadi endpoint sendiri, bukan mencocokkan di sisi klien. index()
     * menerapkan filter kategori dan pencarian, jadi mencari hasil pindaian di
     * daftar yang sudah tersaring membuat barang yang sah dilaporkan "tidak
     * ditemukan" hanya karena kebetulan ada filter aktif.
     *
     * Kode dikirim lewat query string, bukan segmen path, supaya kode yang
     * mengandung titik atau garis miring tetap terbaca utuh.
     */
    public function lookup(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:255',
        ]);

        $inventory = Inventory::withCount([
                'loans as active_loans' => fn ($q) => $q->where('status', 'dipinjam'),
            ])
            ->where('item_code', $validated['code'])
            ->first();

        if (! $inventory) {
            return response()->json([
                'message' => "Barang dengan kode {$validated['code']} tidak ditemukan.",
            ], 404);
        }

        // Satu baris peminjaman mewakili satu unit — inventory_loans tidak
        // menyimpan jumlah. Dijaga agar tidak negatif, karena storeLoan belum
        // membatasi peminjaman terhadap stok yang tersisa.
        $inventory->available_units = max(0, $inventory->quantity - $inventory->active_loans);

        return response()->json(['data' => $inventory]);
    }

    // Loans
    public function loans(Request $request)
    {
        $query = InventoryLoan::with('inventory')->orderBy('created_at', 'desc');

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        return response()->json(['data' => $query->get()]);
    }

    public function storeLoan(Request $request)
    {
        $validated = $request->validate([
            'inventory_id' => 'required|exists:inventories,id',
            'borrower_name' => 'required|string|max:255',
            'loan_date' => 'required|date',
            'notes' => 'nullable|string'
        ]);

        $validated['status'] = 'dipinjam';

        $loan = InventoryLoan::create($validated);
        return response()->json(['message' => 'Peminjaman berhasil dicatat', 'data' => $loan->load('inventory')], 201);
    }

    public function returnLoan(Request $request, $id)
    {
        $loan = InventoryLoan::findOrFail($id);
        
        $validated = $request->validate([
            'return_date' => 'required|date',
            'condition' => 'required|in:baik,rusak_ringan,rusak_berat' // optional: update kondisi barang saat kembali
        ]);

        $loan->update([
            'return_date' => $validated['return_date'],
            'status' => 'dikembalikan'
        ]);

        // Update inventory condition if changed
        $loan->inventory->update(['condition' => $validated['condition']]);

        return response()->json(['message' => 'Barang berhasil dikembalikan', 'data' => $loan->load('inventory')]);
    }
}
