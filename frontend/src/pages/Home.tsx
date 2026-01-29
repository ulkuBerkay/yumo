import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import ProductCard from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: string;
    description: string;
    stock: number;
    images: { image_path: string, is_primary: boolean }[];
    category: { name: string };
}

export default function Home() {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch latest products as "featured"
        api.get('/products')
            .then(res => {
                // Take first 3 for the home page
                setFeaturedProducts(res.data.data.slice(0, 3));
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-white">
            {/* Hero Slider */}
            <HeroSlider />

            {/* Featured Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-widest mb-4">Öne Çıkan Ürünler</h2>
                    <div className="w-16 h-1 bg-black mx-auto"></div>
                </div>

                {loading ? (
                    <div className="text-center py-20">Yükleniyor...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-8">
                        {featuredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                <div className="text-center mt-16">
                    <Link to="/urunler" className="inline-block border-b-2 border-black pb-1 text-sm font-bold uppercase tracking-widest hover:text-gray-600 hover:border-gray-600 transition">
                        Tüm Ürünleri Gör
                    </Link>
                </div>
            </div>
        </div>
    );
}
