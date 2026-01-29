<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductLink extends Model
{
    use HasFactory;

    protected $fillable = ['product_id', 'site_name', 'url'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
