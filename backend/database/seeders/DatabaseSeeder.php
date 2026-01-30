<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin User
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@yumo.net',
            'password' => bcrypt('YarenHilalTugsen2026?'),
            'is_admin' => true,
        ]);

        //   $this->call([
        //       CategorySeeder::class,
        //       ProductSeeder::class,
        //   ]);
    }
}
