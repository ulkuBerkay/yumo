import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../lib/axios';
import CustomSelect from '../../components/ui/CustomSelect';

interface Category {
    id: number;
    name: string;
    parent_id: number | null;
}

export default function CategoryForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]); // For parent selection
    const [formData, setFormData] = useState({
        name: '',
        parent_id: '',
        sort_order: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch categories for parent selection
        api.get('/categories').then(res => setCategories(res.data));

        if (id) {
            api.get(`/categories/${id}`).then(res => {
                setFormData({
                    name: res.data.name,
                    parent_id: res.data.parent_id || '',
                    sort_order: res.data.sort_order || ''
                });
            });
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = {
            name: formData.name,
            parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
            sort_order: formData.sort_order ? parseInt(formData.sort_order) : 0
        };

        try {
            if (id) {
                await api.put(`/categories/${id}`, data);
            } else {
                await api.post('/categories', data);
            }
            navigate('/yonetim/kategoriler');
        } catch (err) {
            console.error(err);
            alert('Kayıt işlemi başarısız.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <Link to="/yonetim/kategoriler" className="text-gray-500 hover:text-black flex items-center gap-2 text-sm mb-4 transition">
                    <ArrowLeft size={16} /> Kategorilere Dön
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">{id ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Kategori Adı</label>
                        <input
                            type="text"
                            className="w-full border-0 ring-1 ring-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-black focus:bg-white transition-all shadow-sm placeholder:text-gray-400"
                            placeholder="Örn: Çantalar"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <CustomSelect
                            label="Üst Kategori (Opsiyonel)"
                            value={formData.parent_id || ''}
                            onChange={(val) => setFormData({ ...formData, parent_id: val })}
                            options={[
                                { value: '', label: 'Yok (Ana Kategori)' },
                                ...categories
                                    .filter(c => c.id !== Number(id))
                                    .map(c => ({ value: c.id, label: c.name }))
                            ]}
                            placeholder="Yok (Ana Kategori)"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Sıralama Sırası</label>
                        <input
                            type="number"
                            className="w-full border-0 ring-1 ring-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-black focus:bg-white transition-all shadow-sm placeholder:text-gray-400"
                            placeholder="Örn: 1"
                            value={formData.sort_order}
                            onChange={e => setFormData({ ...formData, sort_order: e.target.value })}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                            <Save size={18} />
                            {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
