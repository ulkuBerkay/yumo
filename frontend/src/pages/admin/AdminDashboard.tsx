import { useEffect, useState } from 'react';
import { Package, ShoppingBag } from 'lucide-react';
import api from '../../lib/axios';

interface Stats {
    totalProducts: number;
    totalCategories: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalCategories: 0 });

    useEffect(() => {
        // Fetch real stats
        const fetchData = async () => {
            const [productsRes, categoriesRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ]);

            setStats({
                totalProducts: productsRes.data.total || productsRes.data.data.length, // Handle paginate response vs regular
                totalCategories: categoriesRes.data.length
            });
        };
        fetchData().catch(console.error);
    }, []);

    const cards = [
        { title: 'Toplam Ürün', value: stats.totalProducts, icon: Package, color: 'bg-blue-500' },
        { title: 'Kategoriler', value: stats.totalCategories, icon: ShoppingBag, color: 'bg-purple-500' },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Genel Bakış</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {cards.map((card, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${card.color} text-white`}>
                            <card.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                            <h3 className="text-xl font-bold text-gray-900">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
