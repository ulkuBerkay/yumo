<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Product extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = ['category_id', 'name', 'slug', 'description', 'price', 'stock', 'is_active', 'sort_order'];

    protected $appends = ['images', 'links'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function links()
    {
        return $this->hasMany(ProductLink::class);
    }

    public function getLinksAttribute()
    {
        return $this->links()->get();
    }

    public function getImagesAttribute()
    {
        return $this->getMedia('products')->map(function ($media) {
            return [
                'id' => $media->id,
                'image_path' => $media->getUrl(), // Returns full URL
                'is_primary' => $media->getCustomProperty('is_primary', false),
            ];
        });
    }
}
