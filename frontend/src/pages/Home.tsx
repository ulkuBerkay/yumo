import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import ProductCard from '../components/ProductCard';

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
            {/* Hero Section */}
            <div className="relative h-[80vh] flex items-center justify-center bg-gray-50 overflow-hidden">
                {/* Background Image Placeholder or Content */}
                <div className="absolute inset-0 z-0 opacity-50">
                    <img
                        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
                        alt="Hero Background"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <span className="block text-sm font-bold tracking-[0.2em] text-gray-900 uppercase mb-4">
                        Yeni Koleksiyon 2026
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 tracking-tight">
                        Zamana Meydan Okuyan Şıklık
                    </h1>
                    <p className="text-lg text-gray-700 mb-10 max-w-2xl mx-auto font-light">
                        Modern yaşam tarzı için tasarlanmış yeni sezon çanta ve aksesuar koleksiyonumuzu keşfedin.
                    </p>
                    <Link to="/urunler" className="inline-block bg-black text-white px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition transform hover:-translate-y-1">
                        Koleksiyonu Keşfet
                    </Link>
                </div>
            </div>

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
