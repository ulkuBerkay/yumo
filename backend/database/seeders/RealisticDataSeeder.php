<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Str;

class RealisticDataSeeder extends Seeder
{
    public function run()
    {
        // Temizle
        Product::checkRelationship('category')->delete(); // Önce ürünleri sil
        Category::query()->delete();

        // 1. Kategoriler (Turkish)
        $categories = [
            ['name' => 'Omuz Çantası', 'slug' => 'omuz-cantasi'],
            ['name' => 'Sırt Çantası', 'slug' => 'sirt-cantasi'],
            ['name' => 'Cüzdan', 'slug' => 'cuzdan'],
            ['name' => 'Telefon Çantası', 'slug' => 'telefon-cantasi'],
            ['name' => 'Aksesuar', 'slug' => 'aksesuar'],
        ];

        $categoryModels = [];
        foreach ($categories as $cat) {
            $categoryModels[] = Category::create($cat);
        }

        // 2. Ürünler (Realistic Turkish Data)
        $products = [
            // Omuz Çantaları
            [
                'name' => 'Asil Deri Omuz Çantası',
                'description' => 'Zarafeti ve fonksiyonelliği bir arada yaşayın.',
                'price' => 1250.00,
                'category_index' => 0
            ],
            [
                'name' => 'Nova Zincirli Çanta',
                'description' => 'Gece şıklığınızı tamamlayacak modern tasarım.',
                'price' => 850.50,
                'category_index' => 0
            ],
            [
                'name' => 'Klasik Baget Çanta',
                'description' => '90\'lar modasından ilham alan zamansız bir parça.',
                'price' => 950.00,
                'category_index' => 0
            ],
             [
                'name' => 'Hera Kapitone Çanta',
                'description' => 'Yumuşak dokusu ve geniş iç hacmi ile günlük kullanım için ideal.',
                'price' => 1100.00,
                'category_index' => 0
            ],
             [
                'name' => 'Vintage Askılı Çanta',
                'description' => 'Eskitme görünümüyle retro sevenler için özel tasarım.',
                'price' => 1350.00,
                'category_index' => 0
            ],

            // Sırt Çantaları
            [
                'name' => 'Atlas Gezgin Sırt Çantası',
                'description' => 'Geniş iç hacmiyle seyahatlerinizin vazgeçilmezi.',
                'price' => 1800.00,
                'category_index' => 1
            ],
            [
                'name' => 'Urban Mini Sırt Çantası',
                'description' => 'Şehir hayatı için pratik ve şık bir çözüm.',
                'price' => 1050.00,
                'category_index' => 1
            ],
             [
                'name' => 'Canvas Doğa Çantası',
                'description' => 'Dayanıklı kanvas kumaştan üretilmiş outdoor dostu çanta.',
                'price' => 1450.00,
                'category_index' => 1
            ],
            [
                'name' => 'Minimalist Deri Sırt Çantası',
                'description' => 'Sade tasarımıyla her kombine uyum sağlayan deri şıklığı.',
                'price' => 2200.00,
                'category_index' => 1
            ],
             [
                'name' => 'Retro Okul Çantası',
                'description' => 'Nostaljik tasarımı modern konforla buluşturan model.',
                'price' => 1150.00,
                'category_index' => 1
            ],


            // Cüzdanlar
            [
                'name' => 'Prestij Deri Cüzdan',
                'description' => 'Birinci sınıf deri, çok sayıda kart bölmesi.',
                'price' => 450.00,
                'category_index' => 2
            ],
            [
                'name' => 'Kompakt Kartlık',
                'description' => 'Sadece en gerekli kartlarınız için ince tasarım.',
                'price' => 250.00,
                'category_index' => 2
            ],
             [
                'name' => 'Fermuarlı Kadın Cüzdanı',
                'description' => 'Güvenli kullanım sunan geniş ve şık cüzdan.',
                'price' => 550.00,
                'category_index' => 2
            ],
             [
                'name' => 'El Yapımı Deri Portföy',
                'description' => 'Usta ellerden çıkmış özel bir tasarım.',
                'price' => 750.00,
                'category_index' => 2
            ],
            [
                'name' => 'Desenli Clutch Cüzdan',
                'description' => 'Canlı renkleri ve desenleriyle dikkat çekici.',
                'price' => 350.00,
                'category_index' => 2
            ],

            // Telefon Çantaları
            [
                'name' => 'Pratik Telefon Çantası',
                'description' => 'Sadece telefonunuz ve kartlarınız için hafif çözüm.',
                'price' => 300.00,
                'category_index' => 3
            ],
            [
                'name' => 'Zincirli Telefon Cüzdanı',
                'description' => 'Hem cüzdan hem telefon kılıfı olarak kullanın.',
                'price' => 420.00,
                'category_index' => 3
            ],
            [
                'name' => 'Spor Bel Çantası',
                'description' => 'Spor yaparken veya yürüyüşte telefonunuzu güvende tutun.',
                'price' => 280.00,
                'category_index' => 3
            ],

             // Aksesuar
            [
                'name' => 'Anadolu Motifi Gümüş Kolye',
                'description' => 'Geleneksel motiflerin modern yorumu.',
                'price' => 600.00,
                'category_index' => 4
            ],
             [
                'name' => 'İnci Detaylı Küpe',
                'description' => 'Zarif inci detaylarıyla her davete uygun.',
                'price' => 350.00,
                'category_index' => 4
            ],
             [
                'name' => 'Deri Bileklik',
                'description' => 'Günlük kullanım için şık deri bileklik.',
                'price' => 150.00,
                'category_index' => 4
            ],
             [
                'name' => 'İpek Fular',
                'description' => '%100 ipek yumuşaklığı ve canlı renkler.',
                'price' => 500.00,
                'category_index' => 4
            ],
            [
                'name' => 'Güneş Gözlüğü',
                'description' => 'UV korumalı trend güneş gözlüğü.',
                'price' => 750.00,
                'category_index' => 4
            ],
        ];

        // 50 Ürüne Tamamla (Randomized variations)
        for ($i = 0; $i < 30; $i++) {
            $base = $products[array_rand($products)];
            $products[] = [
                'name' => $base['name'] . ' ' . rand(100, 999), // Uniqueify
                'description' => $base['description'],
                'price' => $base['price'] + rand(-50, 50),
                'category_index' => $base['category_index']
            ];
        }

        foreach ($products as $p) {
            $slug = Str::slug($p['name']);
            // Ensure unique slug
            if (Product::where('slug', $slug)->exists()) {
                $slug .= '-' . Str::random(5);
            }

            $product = Product::create([
                'category_id' => $categoryModels[$p['category_index']]->id,
                'name' => $p['name'],
                'slug' => $slug,
                'description' => $p['description'], // Detailed descriptions removed for brevity in generation, keeping short
                'price' => $p['price'],
                'stock' => rand(5, 50),
                'is_active' => true,
            ]);
            
             // Add placeholder media if needed (skipping actual image copy to keep it simple, assumes generic placeholder logic in frontend works)
        }
    }
}
