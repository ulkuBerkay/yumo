<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductImage;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::all();
        
        // Ensure we have categories
        if ($categories->isEmpty()) {
            $this->call(CategorySeeder::class);
            $categories = Category::all();
        }

        $adjectives = ['Şık', 'Modern', 'Deri', 'Klasik', 'Minimal', 'Lüks', 'Günlük', 'Vintage', 'Zarif'];
        $nouns = ['Çanta', 'Cüzdan', 'Kılıf', 'Valiz', 'Portföy', 'Omuz Çantası'];

        for ($i = 0; $i < 50; $i++) {
            $name = $adjectives[array_rand($adjectives)] . ' ' . $nouns[array_rand($nouns)] . ' ' . rand(100, 999);
            
            $product = Product::create([
                'category_id' => $categories->random()->id,
                'name' => $name,
                'slug' => Str::slug($name) . '-' . Str::random(6),
                'description' => 'Bu harika ' . $name . ' ile tarzınızı yansıtın. Yüksek kaliteli malzemeden üretilmiştir.',
                'price' => rand(500, 5000),
                'stock' => rand(0, 100),
            ]);

            // Add the image
            // We assume the image is stored in storage/app/public/products/yumo1.png
            // or accessible via a path. Since user said "use asset png", 
            // if we copy it to a standard place, we can reference it.
            // Let's assume we will copy it to storage/products/yumo1.png and link it.
            // The frontend usually expects a full URL or relative path.
            // If we use 'storage/products/yumo1.png' (relative to public),
            // helper asset() in Laravel points to public folder.
            
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => '/storage/products/yumo1.png', 
                'is_primary' => true
            ]);
        }
    }
}
