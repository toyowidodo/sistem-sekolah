<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\PointCategory;

class PointCategoryController extends Controller
{
    public function index()
    {
        $categories = PointCategory::all();
        return response()->json(['data' => $categories]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:pelanggaran,prestasi',
            'point_value' => 'required|integer|min:1',
        ]);

        $category = PointCategory::create($validated);
        return response()->json(['message' => 'Kategori berhasil ditambahkan.', 'data' => $category], 201);
    }

    public function update(Request $request, $id)
    {
        $category = PointCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:pelanggaran,prestasi',
            'point_value' => 'sometimes|integer|min:1',
        ]);

        $category->update($validated);
        return response()->json(['message' => 'Kategori berhasil diperbarui.', 'data' => $category]);
    }

    public function destroy($id)
    {
        $category = PointCategory::findOrFail($id);
        $category->delete();
        return response()->json(['message' => 'Kategori berhasil dihapus.']);
    }
}
