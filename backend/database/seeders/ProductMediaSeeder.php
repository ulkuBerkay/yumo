<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class ProductMediaSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all();
        $sourceFile = '/var/www/assets/yumo1.png';

        if (!File::exists($sourceFile)) {
            $this->command->error("Source file not found at: $sourceFile");
            return;
        }

        foreach ($products as $product) {
            // Clear existing media
            $product->clearMediaCollection('products');

            // Add new media
            try {
                $product->addMedia($sourceFile)
                    ->preservingOriginal()
                    ->toMediaCollection('products');
                
                // Set first one as primary (custom property logic if needed, 
                // but Spatie doesn't have inherent 'primary', we use custom property or just order)
                $media = $product->getFirstMedia('products');
                if ($media) {
                    $media->setCustomProperty('is_primary', true);
                    $media->save();
                }
                
                $this->command->info("Added media to product: {$product->name}");
            } catch (\Exception $e) {
                $this->command->error("Failed to add media to {$product->name}: " . $e->getMessage());
            }
        }
    }
}
