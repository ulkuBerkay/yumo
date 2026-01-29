<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = Category::with('children')
            ->whereNull('parent_id')
            ->orderBy('sort_order', 'asc')
            ->get();
        return response()->json($categories);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|max:2048',
            'sort_order' => 'nullable|integer',
        ]);

        $slug = Str::slug($validated['name']);
        
        if (Category::where('slug', $slug)->exists()) {
            $slug = $slug . '-' . time();
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('categories', 'public');
        }

        $sortOrder = $validated['sort_order'] ?? 0;

        if (Category::where('sort_order', $sortOrder)->exists()) {
            Category::where('sort_order', '>=', $sortOrder)->increment('sort_order');
        }

        $category = Category::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'parent_id' => $validated['parent_id'],
            'image' => $imagePath,
            'sort_order' => $sortOrder,
        ]);

        return response()->json($category, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $category = Category::with('children', 'products')->find($id);

        if (!$category) {
            $category = Category::where('slug', $id)->with('children', 'products')->firstOrFail();
        }

        return response()->json($category);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|max:2048',
            'sort_order' => 'nullable|integer',
        ]);

        if (isset($validated['name'])) {
            $category->name = $validated['name'];
            $category->slug = Str::slug($validated['name']);
        }

        if ($request->hasFile('image')) {
            $category->image = $request->file('image')->store('categories', 'public');
        }

        if (isset($validated['parent_id'])) {
            $category->parent_id = $validated['parent_id'];
        }

        if (isset($validated['sort_order'])) {
             $newOrder = $validated['sort_order'];
             if ($newOrder != $category->sort_order) {
                 if (Category::where('sort_order', $newOrder)->where('id', '!=', $category->id)->exists()) {
                     Category::where('sort_order', '>=', $newOrder)->increment('sort_order');
                 }
                 $category->sort_order = $newOrder;
             }
        }

        $category->save();

        return response()->json($category);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();
        return response()->json(['message' => 'Category deleted']);
    }
}
