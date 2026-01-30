import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus, FolderTree } from 'lucide-react';
import api from '../../lib/axios';

interface Category {
    id: number;
    name: string;
    parent_id: number | null;
    children?: Category[];
}

export default function CategoryList() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = () => {
        api.get('/categories')
            .then(res => setCategories(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories(); // Refresh list
        } catch (err) {
            console.error('Failed to delete', err);
            alert('Silme işlemi başarısız.');
        }
    };

    // Recursive render for nested categories (if supported later, flat for now based on controller)
    const renderCategoryRow = (category: Category, level = 0) => (
        <tr key={category.id} className="hover:bg-gray-50 transition">
            <td className="px-6 py-4 whitespace-nowrap">
                <div style={{ paddingLeft: `${level * 20}px` }} className="flex items-center">
                    <FolderTree size={16} className="text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900">{category.name}</span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-3">
                    <Link to={`/yonetim/kategoriler/${category.id}/duzenle`} className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition">
                        <Edit size={18} />
                    </Link>
                    <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition">
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Kategoriler Yükleniyor...</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kategoriler</h1>
                    <p className="text-gray-500 text-sm mt-1">Ürün kategorilerini yönetin.</p>
                </div>
                <Link to="/yonetim/kategoriler/yeni" className="bg-black text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-sm w-full md:w-auto">
                    <Plus size={18} /> Yeni Kategori
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori Adı</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categories.map(cat => (
                                <div key={cat.id} style={{ display: 'contents' }}>
                                    {renderCategoryRow(cat)}
                                    {cat.children?.map(child => renderCategoryRow(child, 1))}
                                </div>
                            ))}
                        </tbody>
                    </table>
                </div>
                {categories.length === 0 && (
                    <div className="text-center py-12 text-gray-500 text-sm">
                        Henüz kategori eklenmemiş.
                    </div>
                )}
            </div>
        </div>
    );
}
