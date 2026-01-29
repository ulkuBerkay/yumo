import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import api from '../../lib/axios';

export default function SliderForm() {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        subtitle: '',
        description: '',
        button_text: 'Koleksiyonu Keşfet',
        button_link: '/urunler',
        is_active: true,
        sort_order: 0,
    });

    // Explicitly type image as File | null
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (isEdit) {
            setLoading(true);
            api.get(`/sliders`).then(() => { // Or better endpoint `/admin/sliders` or `/sliders/{id}` 
                // Using get all and find because we didn't add show public? Oh wait, public show is not added but we can filter from admin list or add show. 
                // I'll assume I can find it in list for now or just fetch one. 
                // Actually I didn't add show method in controller. I relied on indexAdmin.
                // Let's use indexAdmin and find.
                api.get('/admin/sliders').then(all => {
                    const found = all.data.find((s: any) => s.id == id);
                    if (found) {
                        setForm({
                            title: found.title,
                            subtitle: found.subtitle || '',
                            description: found.description || '',
                            button_text: found.button_text || '',
                            button_link: found.button_link || '',
                            is_active: !!found.is_active,
                            sort_order: found.sort_order
                        });
                        setCurrentImageUrl(found.image_url);
                    }
                });
            }).finally(() => setLoading(false));
        }
    }, [id, isEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setForm({ ...form, [e.target.name]: value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', form.title);
            if (form.subtitle) formData.append('subtitle', form.subtitle);
            if (form.description) formData.append('description', form.description);
            if (form.button_text) formData.append('button_text', form.button_text);
            if (form.button_link) formData.append('button_link', form.button_link);
            formData.append('is_active', form.is_active ? '1' : '0');
            formData.append('sort_order', form.sort_order.toString());

            if (image) {
                formData.append('image', image);
            }

            if (isEdit) {
                formData.append('_method', 'PUT'); // Fake put
                await api.post(`/sliders/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/sliders', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            navigate('/yonetim/slider');
        } catch (error) {
            console.error(error);
            alert('Kaydedilirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEdit && !form.title) return <div>Yükleniyor...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6 text-gray-500 text-sm">
                <button onClick={() => navigate('/yonetim/slider')} className="flex items-center hover:text-black transition mr-2">
                    <ArrowLeft size={16} className="mr-1" />
                    Sliderlar
                </button>
                <span>/</span>
                <span className="ml-2 font-medium text-gray-900">{isEdit ? 'Slider Düzenle' : 'Yeni Slider'}</span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">{isEdit ? 'Slider Düzenle' : 'Yeni Slider Ekle'}</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Üst Başlık (Subtitle)</label>
                                <input
                                    type="text"
                                    name="subtitle"
                                    value={form.subtitle}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                                    placeholder="Örn: YENİ KOLEKSİYON 2026"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ana Başlık (Title) *</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={form.title}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                                    placeholder="Örn: Zamana Meydan Okuyan Şıklık"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                                <textarea
                                    name="description"
                                    rows={4}
                                    value={form.description}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                                    placeholder="Slider için kısa açıklama..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Arkaplan Görseli</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="space-y-2">
                                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:text-gray-600 transition">
                                            <ImageIcon size={24} />
                                        </div>
                                        <span className="block text-sm text-gray-500">Görsel seçmek için tıklayın veya sürükleyin</span>
                                    </div>
                                </div>
                                {(preview || currentImageUrl) && (
                                    <div className="mt-4 relative rounded-lg overflow-hidden border border-gray-200">
                                        <img
                                            src={preview || currentImageUrl || ''}
                                            alt="Preview"
                                            className="w-full h-48 object-cover"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Buton Yazısı</label>
                                    <input
                                        type="text"
                                        name="button_text"
                                        value={form.button_text}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Buton Linki</label>
                                    <input
                                        type="text"
                                        name="button_link"
                                        value={form.button_link}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                                        placeholder="Örn: /urunler veya https://google.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sıralama (0 ilk sırada)</label>
                            <input
                                type="number"
                                name="sort_order"
                                value={form.sort_order}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                            />
                        </div>
                        <div className="flex items-center h-full pt-6">
                            <label className="flex items-center cursor-pointer relative">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={form.is_active}
                                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                <span className="ml-3 text-sm font-medium text-gray-900">Aktif</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button type="button" onClick={() => navigate('/yonetim/slider')} className="text-gray-500 hover:text-black font-medium px-6 py-2 mr-4 transition">
                            İptal
                        </button>
                        <button type="submit" disabled={loading} className="bg-black text-white px-8 py-2 rounded-lg font-medium hover:bg-gray-800 transition flex items-center justify-center min-w-[120px]">
                            {loading ? 'Kaydediliyor...' : (
                                <>
                                    <Save size={18} className="mr-2" />
                                    Kaydet
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
