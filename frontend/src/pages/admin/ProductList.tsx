import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus } from 'lucide-react';
import api from '../../lib/axios';

interface Product {
    id: number;
    name: string;
    price: string;
    stock: number;
    category: { name: string };
    images?: { image_path: string, is_primary: boolean }[];
    is_active: boolean;
    sort_order: number;
}

export default function ProductList() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const fetchProducts = (page: number) => {
        setLoading(true);
        // Using a reasonable per_page like 12 or 20 for pagination UI
        api.get(`/products?show_all=1&page=${page}&per_page=12`)
            .then(res => {
                setProducts(res.data.data);
                setCurrentPage(res.data.current_page);
                setLastPage(res.data.last_page);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchProducts(currentPage);
    }, [currentPage]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= lastPage) {
            setCurrentPage(newPage);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            fetchProducts(currentPage); // Refresh page after delete
        } catch (err) {
            console.error('Failed to delete', err);
            alert('Failed to delete product');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Ürünler Yükleniyor...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
                    <p className="text-gray-500 text-sm mt-1">Mağazanızdaki tüm ürünleri yönetin.</p>
                </div>
                <Link to="/yonetim/urunler/yeni" className="bg-black text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition shadow-sm">
                    <Plus size={18} /> Yeni Ürün
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Görsel</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ürün Adı</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sıralama</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fiyat</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stok</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map(product => {
                            const mainImage = product.images?.find(img => img.is_primary) || product.images?.[0];
                            return (
                                <tr key={product.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                                            {mainImage ? (
                                                <img
                                                    src={mainImage.image_path.startsWith('http') ? mainImage.image_path : `http://localhost:8081${mainImage.image_path}`}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-300">
                                                    <span className="text-xs">No img</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{product.category?.name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono">{product.sort_order}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">₺{product.price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{product.stock}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {product.is_active ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-3">
                                            <Link to={`/yonetim/urunler/${product.id}/duzenle`} className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition">
                                                <Edit size={18} />
                                            </Link>
                                            <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {products.length === 0 && (
                    <div className="text-center py-12 text-gray-500 text-sm">
                        Henüz ürün eklenmemiş.
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {lastPage > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Önceki
                    </button>

                    <div className="flex space-x-1">
                        {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 border rounded-md text-sm font-medium transition ${currentPage === page
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === lastPage}
                        className="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Sonraki
                    </button>
                </div>
            )}
        </div>
    );
}
