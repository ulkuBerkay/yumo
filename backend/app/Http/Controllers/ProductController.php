<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'media']);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('category_slug')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category_slug);
            });
        }

        // Default to showing only active products, unless 'show_all' is present (for admin)
        if (!$request->has('show_all')) {
            $query->where('is_active', true);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        }

        if ($request->has('sort')) {
            switch ($request->sort) {
                case 'newest':
                    $query->orderBy('created_at', 'desc');
                    break;
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                default:
                    $query->orderBy('sort_order', 'asc');
                    break;
            }
        } else {
            $query->orderBy('sort_order', 'asc');
        }

        $perPage = $request->input('per_page', 12);
        $products = $query->paginate($perPage);

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
            'images.*' => 'nullable|image|max:10240', // Increased limit
            'new_images_sort' => 'nullable|array', // Array of sort orders corresponding to images[] indices
            'links' => 'nullable|array',
            'links.*.site_name' => 'required_with:links|string',
            'links.*.url' => 'required_with:links|url',
            'sort_order' => 'nullable|integer',
        ]);

        $slug = Str::slug($validated['name']);
        if (Product::where('slug', $slug)->exists()) {
            $slug = $slug . '-' . time();
        }

        $sortOrder = $validated['sort_order'] ?? 0;
        if (Product::where('sort_order', $sortOrder)->exists()) {
            Product::where('sort_order', '>=', $sortOrder)->increment('sort_order');
        }

        $product = Product::create([
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'stock' => $validated['stock'],
            'is_active' => true,
            'sort_order' => $sortOrder,
        ]);

        if (isset($validated['links'])) {
            $product->links()->createMany($validated['links']);
        }

        if ($request->hasFile('images')) {
            $sortOrders = $request->input('new_images_sort', []);
            foreach ($request->file('images') as $index => $image) {
                // Determine sort order: explicitly provided or default logic (e.g. 0 or iterate)
                $order = isset($sortOrders[$index]) ? (int) $sortOrders[$index] : 0;

                $media = $product->addMedia($image)->toMediaCollection('products');

                // Update order_column
                $media->order_column = $order;

                if ($index === 0 && !$product->getMedia('products')->where('custom_properties.is_primary', true)->count()) {
                    $media->setCustomProperty('is_primary', true);
                }
                $media->save();
            }
        }

        return response()->json($product->load('links'), 201);
    }

    public function show($id)
    {
        $product = Product::with(['category'])->find($id);

        if (!$product) {
            $product = Product::where('slug', $id)->with(['category'])->firstOrFail();
        }

        return response()->json($product);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric',
            'stock' => 'sometimes|integer',
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'nullable|integer',
            'links' => 'nullable|array',
            'links.*.site_name' => 'required_with:links|string',
            'links.*.url' => 'required_with:links|url',
            'existing_images_sort' => 'nullable|array', // [media_id => order, ...]
            'new_images_sort' => 'nullable|array', // [index => order, ...]
        ]);

        if (isset($validated['name'])) {
            $product->slug = Str::slug($validated['name']);
        }

        if (isset($validated['sort_order'])) {
            $newOrder = $validated['sort_order'];
            if ($newOrder != $product->sort_order) {
                if (Product::where('sort_order', $newOrder)->where('id', '!=', $product->id)->exists()) {
                    Product::where('sort_order', '>=', $newOrder)->increment('sort_order');
                }
                $product->sort_order = $newOrder;
            }
        }

        $product->update(collect($validated)->except(['sort_order', 'existing_images_sort', 'new_images_sort'])->toArray());
        $product->save(); // Save sort_order if it was manually set aside from mass update

        if (isset($validated['links'])) {
            $product->links()->delete(); // Simple replacement strategy
            $product->links()->createMany($validated['links']);
        }

        // Update Existing Images Sort Order
        if (isset($validated['existing_images_sort'])) {
            foreach ($validated['existing_images_sort'] as $mediaId => $order) {
                // Ensure media belongs to this product for security
                $media = $product->media()->find($mediaId);
                if ($media) {
                    $media->order_column = (int) $order;
                    $media->save();
                }
            }
        }

        // Handle New Images
        if ($request->hasFile('images')) {
            $sortOrders = $request->input('new_images_sort', []);
            foreach ($request->file('images') as $index => $image) {
                $order = isset($sortOrders[$index]) ? (int) $sortOrders[$index] : 0;
                $media = $product->addMedia($image)->toMediaCollection('products');
                $media->order_column = $order;
                $media->save();
            }
        }

        return response()->json($product->load('links'));
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }
    public function deleteImage(Product $product, $mediaId)
    {
        $media = $product->getMedia('products')->where('id', $mediaId)->first();

        if ($media) {
            $media->delete();
            return response()->json(['message' => 'Image deleted']);
        }

        return response()->json(['message' => 'Image not found'], 404);
    }

    public function getSortPositions()
    {
        // Return lightweight list for form helper
        $products = Product::select('id', 'name', 'sort_order')
            ->orderBy('sort_order', 'asc')
            ->get();
        return response()->json($products);
    }
}
