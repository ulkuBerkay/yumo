import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash } from 'lucide-react';
import api from '../../lib/axios';

interface Slider {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    is_active: boolean;
    sort_order: number;
    image_url: string | null;
}

export default function SliderList() {
    const [sliders, setSliders] = useState<Slider[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSliders = () => {
        api.get('/admin/sliders')
            .then(res => setSliders(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchSliders();
    }, []);

    const deleteSlider = async (id: number) => {
        if (!confirm('Bu sliderı silmek istediğinize emin misiniz?')) return;
        try {
            await api.delete(`/sliders/${id}`);
            setSliders(sliders.filter(s => s.id !== id));
        } catch (error) {
            console.error(error);
            alert('Hata oluştu');
        }
    };

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Slider Yönetimi</h1>
                <Link to="/yonetim/slider/yeni" className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center hover:bg-gray-800 transition w-full md:w-auto">
                    <Plus size={16} className="mr-2" />
                    Yeni Slider
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="w-full overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sıra</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Görsel</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlıklar</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sliders.map((slider) => (
                                <tr key={slider.id} className="hover:bg-gray-50 text-sm">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {slider.sort_order}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="w-20 h-12 bg-gray-100 rounded overflow-hidden">
                                            {slider.image_url ? (
                                                <img src={slider.image_url} alt={slider.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Yok</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{slider.title}</span>
                                            <span className="text-gray-500 text-xs">{slider.subtitle}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {slider.is_active ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                Pasif
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <Link to={`/yonetim/slider/duzenle/${slider.id}`} className="text-blue-600 hover:text-blue-900 p-1">
                                                <Edit size={18} />
                                            </Link>
                                            <button onClick={() => deleteSlider(slider.id)} className="text-red-600 hover:text-red-900 p-1">
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {sliders.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                        Henüz slider eklenmemiş.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
