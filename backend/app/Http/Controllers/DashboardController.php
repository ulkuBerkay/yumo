<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        return response()->json([
            'total_products' => Product::count(),
            'total_categories' => Category::count(),
            'total_users' => User::count(),
        ]);
    }
}
