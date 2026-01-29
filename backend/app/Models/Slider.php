<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Slider extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'subtitle',
        'title',
        'description',
        'button_text',
        'button_link',
        'is_active',
        'sort_order',
    ];

    protected $appends = ['image_url'];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('slider_image')
            ->singleFile();
    }

    public function getImageUrlAttribute()
    {
        return $this->getFirstMediaUrl('slider_image');
    }
}
