import { useEffect, useState } from 'react';
import { Package, Users, DollarSign, ShoppingBag } from 'lucide-react';
import api from '../../lib/axios';

interface Stats {
    totalProducts: number;
    totalCategories: number;
    totalOrders: number; // Placeholder
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalCategories: 0, totalOrders: 0 });

    useEffect(() => {
        // Fetch real stats
        const fetchData = async () => {
            const [productsRes, categoriesRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ]);

            setStats({
                totalProducts: productsRes.data.total || productsRes.data.data.length, // Handle paginate response vs regular
                totalCategories: categoriesRes.data.length,
                totalOrders: 12 // Mock data for now
            });
        };
        fetchData().catch(console.error);
    }, []);

    const cards = [
        { title: 'Toplam Ürün', value: stats.totalProducts, icon: Package, color: 'bg-blue-500' },
        { title: 'Kategoriler', value: stats.totalCategories, icon: ShoppingBag, color: 'bg-purple-500' },
        { title: 'Toplam Sipariş', value: stats.totalOrders, icon: Users, color: 'bg-orange-500' },
        { title: 'Toplam Satış', value: '₺24,500', icon: DollarSign, color: 'bg-green-500' }, // Mock
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity Mock */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Son Aktiviteler</h2>
                    <ul className="space-y-4">
                        <li className="flex items-center text-sm text-gray-600">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                            Yeni sipariş alındı #1234
                            <span className="ml-auto text-gray-400 text-xs">2 dk önce</span>
                        </li>
                        <li className="flex items-center text-sm text-gray-600">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                            Yeni ürün eklendi "Deri Çanta"
                            <span className="ml-auto text-gray-400 text-xs">1 saat önce</span>
                        </li>
                        <li className="flex items-center text-sm text-gray-600">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                            "Yaz İndirimi" kategorisi güncellendi
                            <span className="ml-auto text-gray-400 text-xs">3 saat önce</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
